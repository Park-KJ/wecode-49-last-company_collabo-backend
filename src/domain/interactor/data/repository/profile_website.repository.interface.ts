import { ProfileWebsiteVo } from 'src/infra/data/typeorm/vo/profile_website.vo';

export interface IProfileWebsiteRepository {
  findWebsiteByProfileId(profileId: number): Promise<ProfileWebsiteVo[] | null>;
}