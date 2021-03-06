import { cache } from "../../../utils/cache";
import { UseCase } from "../../common/entities/UseCase";
import { RepositoryFactory } from "../../common/factories/RepositoryFactory";
import { Instance } from "../../instance/entities/Instance";
import { InstanceRepositoryConstructor } from "../../instance/repositories/InstanceRepository";
import { Repositories } from "../../Repositories";
import { Namespace } from "../../storage/Namespaces";
import { StorageRepositoryConstructor } from "../../storage/repositories/StorageRepository";
import { MetadataModule } from "../entities/MetadataModule";
import { BaseModule, Module } from "../entities/Module";

export class ListModulesUseCase implements UseCase {
    constructor(private repositoryFactory: RepositoryFactory, private localInstance: Instance) {}

    public async execute(
        bypassSharingSettings = false,
        instance = this.localInstance
    ): Promise<Module[]> {
        const userGroups = await this.instanceRepository(this.localInstance).getUserGroups();
        const { id: userId } = await this.instanceRepository(this.localInstance).getUser();

        const data = await this.storageRepository(instance).listObjectsInCollection<BaseModule>(
            Namespace.MODULES
        );

        return data
            .map(module => {
                switch (module.type) {
                    case "metadata":
                        return MetadataModule.build(module);
                    default:
                        throw new Error("Unknown module");
                }
            })
            .filter(
                module => bypassSharingSettings || module.hasPermissions("read", userId, userGroups)
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
}
