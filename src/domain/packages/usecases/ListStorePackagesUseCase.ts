import _ from "lodash";
import moment from "moment";
import { cache } from "../../../utils/cache";
import { Either } from "../../common/entities/Either";
import { UseCase } from "../../common/entities/UseCase";
import { RepositoryFactory } from "../../common/factories/RepositoryFactory";
import { Instance } from "../../instance/entities/Instance";
import { Repositories } from "../../Repositories";
import { Namespace } from "../../storage/Namespaces";
import { StorageRepositoryConstructor } from "../../storage/repositories/StorageRepository";
import { Package } from "../entities/Package";
import { Store } from "../entities/Store";
import { GitHubRepositoryConstructor } from "../repositories/GitHubRepository";
import { BaseModule } from "../../modules/entities/Module";
import { promiseMap } from "../../../utils/common";
import { MetadataModule } from "../../modules/entities/MetadataModule";
import { GitHubListError } from "../entities/Errors";
import { InstanceRepositoryConstructor } from "../../instance/repositories/InstanceRepository";

export type ListStorePackagesError = any;

export class ListStorePackagesUseCase implements UseCase {
    constructor(private repositoryFactory: RepositoryFactory, private localInstance: Instance) {}

    public async execute(): Promise<Either<ListStorePackagesError, Package[]>> {
        const store = await this.storageRepository(this.localInstance).getObject<Store>(
            Namespace.STORE
        );
        if (!store) return Either.error("STORE_NOT_FOUND");

        const userGroups = await this.instanceRepository(this.localInstance).getUserGroups();

        const validation = await promiseMap(userGroups, userGroup =>
            this.getPackages(store, userGroup.name)
        );

        const packages = _.compact(validation.flatMap(({ value }) => value.data));

        return Either.success(packages);
    }

    @cache()
    private gitRepository() {
        return this.repositoryFactory.get<GitHubRepositoryConstructor>(
            Repositories.GitHubRepository,
            []
        );
    }

    @cache()
    private storageRepository(instance: Instance) {
        return this.repositoryFactory.get<StorageRepositoryConstructor>(
            Repositories.StorageRepository,
            [instance]
        );
    }

    @cache()
    private instanceRepository(instance: Instance) {
        return this.repositoryFactory.get<InstanceRepositoryConstructor>(
            Repositories.InstanceRepository,
            [instance, ""]
        );
    }

    private async getPackages(
        store: Store,
        userGroup: string
    ): Promise<Either<GitHubListError, Package[]>> {
        const validation = await this.gitRepository().listFiles(store, userGroup);

        if (validation.isError()) return Either.error(validation.value.error);

        const files = validation.value.data ?? [];

        const packages = await promiseMap(files, async ({ path, type }) => {
            if (type !== "blob") return undefined;

            const details = this.extractPackageDetailsFromPath(path);
            if (!details) return undefined;

            const { moduleName, name, version, dhisVersion, created } = details;
            const module =
                (await this.getModule(moduleName)) ??
                MetadataModule.build({
                    name: "Unknown module",
                });

            return Package.build({ name, version, dhisVersion, created, module });
        });

        return Either.success(_.compact(packages));
    }

    private async getModule(moduleName: string): Promise<BaseModule | undefined> {
        const modules = await this.storageRepository(this.localInstance).listObjectsInCollection<
            BaseModule
        >(Namespace.MODULES);

        return modules.find(({ name }) => name === moduleName);
    }

    private extractPackageDetailsFromPath(path: string) {
        const tokens = path.split("-");
        if (tokens.length === 4) {
            const [fileName, version, dhisVersion, date] = tokens;
            const [moduleName, ...name] = fileName.split("/");

            return {
                moduleName,
                name: name.join("/"),
                version,
                dhisVersion,
                created: moment(date, "YYYYMMDDHHmm").toDate(),
            };
        } else if (tokens.length === 5) {
            const [fileName, version, versionTag, dhisVersion, date] = tokens;
            const [moduleName, ...name] = fileName.split("/");

            return {
                moduleName,
                name: name.join("/"),
                version: `${version}-${versionTag}`,
                dhisVersion,
                created: moment(date, "YYYYMMDDHHmm").toDate(),
            };
        } else return null;
    }
}
