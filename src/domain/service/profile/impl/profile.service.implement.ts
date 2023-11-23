import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
// eslint-disable-next-line @typescript-eslint/no-unused-vars

import { IProfileService } from '../profile.service.interface';
import {
  PROFILE_EDUCATION_REPOSITORY,
  PROFILE_EXPERIENCE_REPOSITORY,
  PROFILE_PROJECT_REPOSITORY,
  PROFILE_REPOSITORY,
  PROFILE_WEBSITE_REPOSITORY,
  USER_REPOSITORY,
} from 'src/infra/data/interactor/repository/ioc';
import { IProfileRepository } from 'src/domain/interactor/data/repository/profile.repository.interface';
import { ProfileVo } from 'src/infra/data/typeorm/vo/profile.vo';
import { IProfileProjectRepository } from 'src/domain/interactor/data/repository/profile_project.repository.interface';
import { ProfileProjectVo } from 'src/infra/data/typeorm/vo/profile_project.vo';
import { IProfileExperienceRepository } from 'src/domain/interactor/data/repository/profile_experience.repository.interface';
import { ProfileExperienceVo } from 'src/infra/data/typeorm/vo/profile_experience.vo';
import { IProfileEducationRepository } from 'src/domain/interactor/data/repository/profile_education.repository.interface';
import { ProfileEducationVo } from 'src/infra/data/typeorm/vo/profile_education.vo';
import { IProfileWebsiteRepository } from 'src/domain/interactor/data/repository/profile_website.repository.interface';
import { ProfileWebsiteVo } from 'src/infra/data/typeorm/vo/profile_website.vo';
import { IUserRepository } from 'src/domain/interactor/data/repository/user.repository.interface';
import { ProjectImageVo } from 'src/infra/data/typeorm/vo/project_image.vo';
import { ProjectCategoryVo } from 'src/infra/data/typeorm/vo/project_category.vo';
import { ExperienceCompanyVo } from 'src/infra/data/typeorm/vo/experience_company.vo';
import {
  ProfileDto,
  ProfileEducationDeleteDto,
  ProfileEducationDto,
  ProfileExperienceDeleteDto,
  ProfileExperienceDto,
  ProfileProjectDeleteDto,
  ProfileProjectDto,
  ProfileWebsiteDeleteDto,
  ProfileWebsiteDto,
} from '../../dto/profile.dto';

@Injectable()
export class ProfileServiceImpl implements IProfileService {
  constructor(
    @Inject(PROFILE_REPOSITORY)
    private readonly profileRepository: IProfileRepository,

    @Inject(PROFILE_PROJECT_REPOSITORY)
    private readonly profileProjectRepository: IProfileProjectRepository,

    @Inject(PROFILE_EXPERIENCE_REPOSITORY)
    private readonly profileExperienceRepository: IProfileExperienceRepository,

    @Inject(PROFILE_EDUCATION_REPOSITORY)
    private readonly profileEducationRepository: IProfileEducationRepository,

    @Inject(PROFILE_WEBSITE_REPOSITORY)
    private readonly profileWebsiteRepository: IProfileWebsiteRepository,

    @Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository,
  ) {}

  async getProfileId(userId: number): Promise<ProfileVo | null> {
    const ProfileId =
      await this.profileRepository.findProfileIdByUserId(userId);
    if (!ProfileId) {
      throw new HttpException('PROFILEID_NOT_FOUND', HttpStatus.NOT_FOUND);
    }
    return ProfileId;
  }

  async getUserProfile(profileId: number): Promise<ProfileVo | null> {
    const profile = await this.profileRepository.findProfileByProfileId(
      Number(profileId),
    );

    if (!profile) {
      return null;
    }

    return profile;
  }

  async getProfileProject(
    profileId: number,
  ): Promise<ProfileProjectVo[] | null> {
    const profileProject =
      await this.profileProjectRepository.findProjectByProfileId(
        Number(profileId),
      );

    if (profileProject === null) {
      return null;
    }

    profileProject.forEach((profileProject) => {
      if (
        profileProject.projectImage &&
        profileProject.projectImage.length > 0
      ) {
        profileProject.coverImage = profileProject.projectImage[0];
      }
    });

    return profileProject;
  }

  async getOneProfileProjectByProjectId(
    userId: number,
    profileId: number,
    projectId: number,
  ): Promise<ProfileProjectVo | null> {
    const user = await this.userRepository.findOneById(userId);
    if (!user) throw new HttpException('USER_NOT_FOUND', HttpStatus.NOT_FOUND);

    const profile = await this.profileRepository.findProfileByProfileId(
      Number(profileId),
    );
    if (!profile)
      throw new HttpException('PROFILE_NOT_FOUND', HttpStatus.NOT_FOUND);
    if (profile.user.id !== Number(userId))
      throw new HttpException('UNAUTHORIZED', HttpStatus.UNAUTHORIZED);

    const projectsByProfileId =
      await this.profileProjectRepository.findProjectByProfileId(
        Number(profileId),
      );

    if (!projectsByProfileId)
      throw new HttpException('PROJECT_NOT_FOUND', HttpStatus.NOT_FOUND);

    const projectExists = projectsByProfileId.some(
      (project) => project.id === projectId,
    );
    if (!projectExists)
      throw new HttpException('PROJECT_NOT_FOUND', HttpStatus.NOT_FOUND);

    const project = await this.profileProjectRepository.findProjectByProjectId(
      Number(projectId),
    );
    if (!project) {
      throw new HttpException('PROJECT_NOT_FOUND', HttpStatus.NOT_FOUND);
    } else {
      project.coverImage = project.projectImage[0];
    }

    return project;
  }

  async getProfileExperience(
    profileId: number,
  ): Promise<ProfileExperienceVo[] | null> {
    const profileExperience =
      await this.profileExperienceRepository.findExperienceByProfileId(
        Number(profileId),
      );
    return profileExperience;
  }

  async getOneProfileExperienceByExperienceId(
    userId: number,
    profileId: number,
    experienceId: number,
  ): Promise<ProfileExperienceVo | null> {
    const user = await this.userRepository.findOneById(userId);
    if (!user) throw new HttpException('USER_NOT_FOUND', HttpStatus.NOT_FOUND);

    const profile = await this.profileRepository.findProfileByProfileId(
      Number(profileId),
    );
    if (!profile)
      throw new HttpException('PROFILE_NOT_FOUND', HttpStatus.NOT_FOUND);
    if (profile.user.id !== Number(userId))
      throw new HttpException('UNAUTHORIZED', HttpStatus.UNAUTHORIZED);

    const experiencesByProfileId =
      await this.profileExperienceRepository.findExperienceByProfileId(
        Number(profileId),
      );

    if (!experiencesByProfileId)
      throw new HttpException('EXPERIENCE_NOT_FOUND', HttpStatus.NOT_FOUND);

    const experienceExists = experiencesByProfileId.some(
      (experience) => experience.id === experienceId,
    );
    if (!experienceExists)
      throw new HttpException('EXPERIENCE_NOT_FOUND', HttpStatus.NOT_FOUND);

    const experience =
      await this.profileExperienceRepository.findExperienceByExperienceId(
        Number(experienceId),
      );
    if (!experience)
      throw new HttpException('EXPERIENCE_NOT_FOUND', HttpStatus.NOT_FOUND);

    return experience;
  }

  async getProfileEducation(
    profileId: number,
  ): Promise<ProfileEducationVo[] | null> {
    const profileEducation =
      await this.profileEducationRepository.findEducationByProfileId(
        Number(profileId),
      );
    return profileEducation;
  }

  async getOneProfileEducationByEducationId(
    userId: number,
    profileId: number,
    educationId: number,
  ): Promise<ProfileEducationVo | null> {
    const user = await this.userRepository.findOneById(userId);
    if (!user) throw new HttpException('USER_NOT_FOUND', HttpStatus.NOT_FOUND);

    const profile = await this.profileRepository.findProfileByProfileId(
      Number(profileId),
    );
    if (!profile)
      throw new HttpException('PROFILE_NOT_FOUND', HttpStatus.NOT_FOUND);
    if (profile.user.id !== Number(userId))
      throw new HttpException('UNAUTHORIZED', HttpStatus.UNAUTHORIZED);

    const educationsByProfileId =
      await this.profileEducationRepository.findEducationByProfileId(
        Number(profileId),
      );

    if (!educationsByProfileId)
      throw new HttpException('EDUCATION_NOT_FOUND', HttpStatus.NOT_FOUND);

    const educationExists = educationsByProfileId.some(
      (education) => education.id === educationId,
    );
    if (!educationExists)
      throw new HttpException('EDUCATION_NOT_FOUND', HttpStatus.NOT_FOUND);

    const education =
      await this.profileEducationRepository.findEducationByEducationId(
        Number(educationId),
      );
    if (!education)
      throw new HttpException('EDUCATION_NOT_FOUND', HttpStatus.NOT_FOUND);

    return education;
  }

  async getProfileWebsite(
    profileId: number,
  ): Promise<ProfileWebsiteVo[] | null> {
    const profileWebsite =
      await this.profileWebsiteRepository.findWebsiteByProfileId(
        Number(profileId),
      );
    return profileWebsite;
  }

  async createProfile(profileDto: ProfileDto): Promise<void> {
    const {
      userId,
      jobDescription,
      about,
      location,
      address,
      profileBackImage,
    } = profileDto;
    const user = await this.userRepository.findOneById(userId);
    if (!user) throw new HttpException('USER_NOT_FOUND', HttpStatus.NOT_FOUND);

    const profile = new ProfileVo();
    profile.user = user;
    if (jobDescription) profile.jobDescription = jobDescription;
    if (about) profile.about = about;
    if (location) profile.location = location;
    if (address) profile.address = address;
    if (profileBackImage) profile.profileBackImage = profileBackImage;

    return await this.profileRepository.create(profile);
  }

  async createProfileProject(
    profileProjectDto: ProfileProjectDto,
    profileId: number,
  ): Promise<void> {
    const {
      userId,
      title,
      description,
      startDate,
      endDate,
      projectImages,
      projectCategory,
    } = profileProjectDto;
    const user = await this.userRepository.findOneById(userId);
    if (!user) throw new HttpException('USER_NOT_FOUND', HttpStatus.NOT_FOUND);

    const profile = await this.profileRepository.findProfileByProfileId(
      Number(profileId),
    );
    if (!profile)
      throw new HttpException('PROFILE_NOT_FOUND', HttpStatus.NOT_FOUND);
    if (profile.user.id !== Number(userId))
      throw new HttpException('UNAUTHORIZED', HttpStatus.UNAUTHORIZED);

    const profileProject = new ProfileProjectVo();
    if (profile) profileProject.profile = profile;
    if (title) profileProject.title = title;
    if (description) profileProject.description = description;
    if (startDate) profileProject.startDate = startDate;
    if (endDate) profileProject.endDate = endDate;
    if (projectImages)
      profileProject.projectImage = this.createImageVos(projectImages);
    if (projectCategory)
      profileProject.projectCategory = this.createCategoryVos(projectCategory);

    return await this.profileProjectRepository.create(profileProject);
  }

  async createProfileExperience(
    profileExperienceDto: ProfileExperienceDto,
    profileId: number,
  ) {
    const {
      userId,
      position,
      description,
      startDate,
      endDate,
      experienceCompany,
    } = profileExperienceDto;
    const user = await this.userRepository.findOneById(userId);
    if (!user) throw new HttpException('USER_NOT_FOUND', HttpStatus.NOT_FOUND);

    const profile = await this.profileRepository.findProfileByProfileId(
      Number(profileId),
    );
    if (!profile)
      throw new HttpException('PROFILE_NOT_FOUND', HttpStatus.NOT_FOUND);
    if (profile.user.id !== Number(userId))
      throw new HttpException('UNAUTHORIZED', HttpStatus.UNAUTHORIZED);

    const profileExperience = new ProfileExperienceVo();
    if (profile) profileExperience.profile = profile;
    if (position) profileExperience.position = position;
    if (description) profileExperience.description = description;
    if (startDate) profileExperience.startDate = startDate;
    if (endDate) profileExperience.endDate = endDate;
    if (experienceCompany)
      profileExperience.experienceCompany =
        this.createExperienceCompany(experienceCompany);

    return await this.profileExperienceRepository.create(profileExperience);
  }

  async createProfileEducation(
    profileEducationDto: ProfileEducationDto,
    profileId: number,
  ): Promise<void> {
    const {
      userId,
      course,
      description,
      startDate,
      endDate,
      educationInstitute,
    } = profileEducationDto;

    const user = await this.userRepository.findOneById(userId);
    if (!user) throw new HttpException('USER_NOT_FOUND', HttpStatus.NOT_FOUND);

    const profile = await this.profileRepository.findProfileByProfileId(
      Number(profileId),
    );
    if (!profile)
      throw new HttpException('PROFILE_NOT_FOUND', HttpStatus.NOT_FOUND);
    if (profile.user.id !== Number(userId))
      throw new HttpException('UNAUTHORIZED', HttpStatus.UNAUTHORIZED);

    const profileEducation = new ProfileEducationVo();
    if (profile) profileEducation.profile = profile;
    if (course) profileEducation.course = course;
    if (description) profileEducation.description = description;
    if (startDate) profileEducation.startDate = startDate;
    if (endDate) profileEducation.endDate = endDate;
    if (educationInstitute)
      profileEducation.educationInstitute = educationInstitute;

    return this.profileEducationRepository.create(profileEducation);
  }

  async createProfileWebsite(
    profileWebsiteDto: ProfileWebsiteDto,
    profileId: number,
  ): Promise<void> {
    const { userId, type, url } = profileWebsiteDto;

    const user = await this.userRepository.findOneById(userId);
    if (!user) throw new HttpException('USER_NOT_FOUND', HttpStatus.NOT_FOUND);

    const profile = await this.profileRepository.findProfileByProfileId(
      Number(profileId),
    );
    if (!profile)
      throw new HttpException('PROFILE_NOT_FOUND', HttpStatus.NOT_FOUND);
    if (profile.user.id !== Number(userId))
      throw new HttpException('UNAUTHORIZED', HttpStatus.UNAUTHORIZED);

    const profileWebsite = new ProfileWebsiteVo();
    if (profile) profileWebsite.profile = profile;
    if (type) profileWebsite.type = type;
    if (url) profileWebsite.url = url;

    return await this.profileWebsiteRepository.create(profileWebsite);
  }

  async updateProfile(
    profileUpdateDto: ProfileDto,
    profileId: number,
  ): Promise<void> {
    const {
      userId,
      jobDescription,
      about,
      location,
      address,
      profileBackImage,
    } = profileUpdateDto;

    const user = await this.userRepository.findOneById(userId);
    if (!user) throw new HttpException('USER_NOT_FOUND', HttpStatus.NOT_FOUND);

    const profile = await this.profileRepository.findProfileByProfileId(
      Number(profileId),
    );
    if (!profile)
      throw new HttpException('PROFILE_NOT_FOUND', HttpStatus.NOT_FOUND);
    if (profile.user.id !== Number(userId))
      throw new HttpException('UNAUTHORIZED', HttpStatus.UNAUTHORIZED);

    if (jobDescription) profile.jobDescription = jobDescription;
    if (about) profile.about = about;
    if (location) profile.location = location;
    if (address) profile.address = address;
    if (profileBackImage) profile.profileBackImage = profileBackImage;

    await this.profileRepository.update(profile);
  }

  async updateProfileProject(
    profileProjectUpdateDto: ProfileProjectDto,
    profileId: number,
    projectId: number,
  ): Promise<void> {
    const {
      userId,
      title,
      description,
      startDate,
      endDate,
      projectImages,
      projectCategory,
    } = profileProjectUpdateDto;

    const user = await this.userRepository.findOneById(userId);
    if (!user) throw new HttpException('USER_NOT_FOUND', HttpStatus.NOT_FOUND);

    const profile = await this.profileRepository.findProfileByProfileId(
      Number(profileId),
    );
    if (!profile)
      throw new HttpException('PROFILE_NOT_FOUND', HttpStatus.NOT_FOUND);
    if (profile.user.id !== Number(userId))
      throw new HttpException('UNAUTHORIZED', HttpStatus.UNAUTHORIZED);

    const projectsByProfileId =
      await this.profileProjectRepository.findProjectByProfileId(
        Number(profileId),
      );

    if (!projectsByProfileId)
      throw new HttpException('PROJECT_NOT_FOUND', HttpStatus.NOT_FOUND);

    const projectExists = projectsByProfileId.some(
      (project) => project.id === projectId,
    );
    if (!projectExists)
      throw new HttpException('PROJECT_NOT_FOUND', HttpStatus.NOT_FOUND);

    const project = await this.profileProjectRepository.findProjectByProjectId(
      Number(projectId),
    );
    if (!project)
      throw new HttpException('PROJECT_NOT_FOUND', HttpStatus.NOT_FOUND);

    if (title) project.title = title;
    if (description) project.description = description;
    if (startDate) project.startDate = startDate;
    if (endDate) project.endDate = endDate;
    if (projectImages)
      project.projectImage = this.createImageVos(projectImages);
    if (projectCategory)
      project.projectCategory.title =
        this.createCategoryVos(projectCategory).title;

    return await this.profileProjectRepository.update(project);
  }

  async updateProfileExperience(
    profileExperienceUpdateDto: ProfileExperienceDto,
    profileId: number,
    experienceId: number,
  ): Promise<void> {
    const {
      userId,
      position,
      description,
      startDate,
      endDate,
      experienceCompany,
    } = profileExperienceUpdateDto;

    const user = await this.userRepository.findOneById(userId);
    if (!user) throw new HttpException('USER_NOT_FOUND', HttpStatus.NOT_FOUND);

    const profile = await this.profileRepository.findProfileByProfileId(
      Number(profileId),
    );
    if (!profile)
      throw new HttpException('PROFILE_NOT_FOUND', HttpStatus.NOT_FOUND);
    if (profile.user.id !== Number(userId))
      throw new HttpException('UNAUTHORIZED', HttpStatus.UNAUTHORIZED);

    const experiencesByProfileId =
      await this.profileExperienceRepository.findExperienceByProfileId(
        Number(profileId),
      );

    if (!experiencesByProfileId)
      throw new HttpException('EXPERIENCE_NOT_FOUND', HttpStatus.NOT_FOUND);

    const experienceExists = experiencesByProfileId.some(
      (experience) => experience.id === experienceId,
    );
    if (!experienceExists)
      throw new HttpException('EXPERIENCE_NOT_FOUND', HttpStatus.NOT_FOUND);

    const experience =
      await this.profileExperienceRepository.findExperienceByExperienceId(
        Number(experienceId),
      );
    if (!experience)
      throw new HttpException('EXPERIENCE_NOT_FOUND', HttpStatus.NOT_FOUND);

    if (position) experience.position = position;
    if (description) experience.description = description;
    if (startDate) experience.startDate = startDate;
    if (endDate) experience.endDate = endDate;
    if (experienceCompany)
      experience.experienceCompany.name = experienceCompany.name;
    if (experienceCompany)
      experience.experienceCompany.logo = experienceCompany.logo;
    if (experienceCompany)
      experience.experienceCompany.location = experienceCompany.location;

    return await this.profileExperienceRepository.update(experience);
  }

  async updateProfileEducation(
    profileEducationUpdateDto: ProfileEducationDto,
    profileId: number,
    educationId: number,
  ): Promise<void> {
    const {
      userId,
      course,
      description,
      startDate,
      endDate,
      educationInstitute,
    } = profileEducationUpdateDto;

    const user = await this.userRepository.findOneById(userId);
    if (!user) throw new HttpException('USER_NOT_FOUND', HttpStatus.NOT_FOUND);

    const profile = await this.profileRepository.findProfileByProfileId(
      Number(profileId),
    );
    if (!profile)
      throw new HttpException('PROFILE_NOT_FOUND', HttpStatus.NOT_FOUND);
    if (profile.user.id !== Number(userId))
      throw new HttpException('UNAUTHORIZED', HttpStatus.UNAUTHORIZED);

    const educationsByProfileId =
      await this.profileEducationRepository.findEducationByProfileId(
        Number(profileId),
      );

    if (!educationsByProfileId)
      throw new HttpException('EDUCATION_NOT_FOUND', HttpStatus.NOT_FOUND);

    const educationExists = educationsByProfileId.some(
      (education) => education.id === educationId,
    );
    if (!educationExists)
      throw new HttpException('EDUCATION_NOT_FOUND', HttpStatus.NOT_FOUND);

    const education =
      await this.profileEducationRepository.findEducationByEducationId(
        Number(educationId),
      );
    if (!education)
      throw new HttpException('EDUCATION_NOT_FOUND', HttpStatus.NOT_FOUND);

    if (course) education.course = course;
    if (description) education.description = description;
    if (startDate) education.startDate = startDate;
    if (endDate) education.endDate = endDate;
    if (educationInstitute)
      education.educationInstitute.logo = educationInstitute.logo;
    if (educationInstitute)
      education.educationInstitute.name = educationInstitute.name;

    return await this.profileEducationRepository.update(education);
  }

  async updateProfileWebsite(
    profileWebsiteUpdateDto: ProfileWebsiteDto,
    profileId: number,
    websiteId: number,
  ): Promise<void> {
    const { userId, type, url } = profileWebsiteUpdateDto;

    const user = await this.userRepository.findOneById(userId);
    if (!user) throw new HttpException('USER_NOT_FOUND', HttpStatus.NOT_FOUND);

    const profile = await this.profileRepository.findProfileByProfileId(
      Number(profileId),
    );
    if (!profile)
      throw new HttpException('PROFILE_NOT_FOUND', HttpStatus.NOT_FOUND);
    if (profile.user.id !== Number(userId))
      throw new HttpException('UNAUTHORIZED', HttpStatus.UNAUTHORIZED);

    const websitesByProfileId =
      await this.profileWebsiteRepository.findWebsiteByProfileId(
        Number(profileId),
      );

    if (!websitesByProfileId)
      throw new HttpException('WEBSITE_NOT_FOUND', HttpStatus.NOT_FOUND);

    const websiteExists = websitesByProfileId.some(
      (website) => website.id === websiteId,
    );
    if (!websiteExists)
      throw new HttpException('WEBSITE_NOT_FOUND', HttpStatus.NOT_FOUND);

    const website = await this.profileWebsiteRepository.findWebsiteByWebsiteId(
      Number(websiteId),
    );
    if (!website)
      throw new HttpException('WEBSITE_NOT_FOUND', HttpStatus.NOT_FOUND);

    if (type) website.type = type;
    if (url) website.url = url;

    return this.profileWebsiteRepository.update(website);
  }

  async deleteProfileProject(
    profileProjectDeleteDto: ProfileProjectDeleteDto,
  ): Promise<void> {
    const { userId, profileId, projectId } = profileProjectDeleteDto;

    const user = await this.userRepository.findOneById(userId);
    if (!user) throw new HttpException('USER_NOT_FOUND', HttpStatus.NOT_FOUND);

    const profile =
      await this.profileRepository.findProfileByProfileId(profileId);
    if (!profile)
      throw new HttpException('PROFILE_NOT_FOUND', HttpStatus.NOT_FOUND);
    if (profile.user.id !== Number(userId))
      throw new HttpException('UNAUTHORIZED', HttpStatus.UNAUTHORIZED);

    const projectsByProfileId =
      await this.profileProjectRepository.findProjectByProfileId(profileId);
    if (!projectsByProfileId)
      throw new HttpException('PROJECT_NOT_FOUND', HttpStatus.NOT_FOUND);

    const projectExists = projectsByProfileId.some(
      (project) => project.id === projectId,
    );
    if (!projectExists)
      throw new HttpException('PROJECT_NOT_FOUND', HttpStatus.NOT_FOUND);

    const project =
      await this.profileProjectRepository.findProjectByProjectId(projectId);
    if (!project)
      throw new HttpException('PROJECT_NOT_FOUND', HttpStatus.NOT_FOUND);

    return await this.profileProjectRepository.remove(project);
  }

  async deleteProfileExperience(
    profileExperienceDeleteDto: ProfileExperienceDeleteDto,
  ): Promise<void> {
    const { userId, profileId, experienceId } = profileExperienceDeleteDto;

    const user = await this.userRepository.findOneById(userId);
    if (!user) throw new HttpException('USER_NOT_FOUND', HttpStatus.NOT_FOUND);

    const profile =
      await this.profileRepository.findProfileByProfileId(profileId);
    if (!profile)
      throw new HttpException('PROFILE_NOT_FOUND', HttpStatus.NOT_FOUND);
    if (profile.user.id !== Number(userId))
      throw new HttpException('UNAUTHORIZED', HttpStatus.UNAUTHORIZED);

    const experiencesByProfileId =
      await this.profileExperienceRepository.findExperienceByProfileId(
        profileId,
      );
    if (!experiencesByProfileId)
      throw new HttpException('EXPERIENCE_NOT_FOUND', HttpStatus.NOT_FOUND);

    const experienceExists = experiencesByProfileId.some(
      (experience) => experience.id === experienceId,
    );
    if (!experienceExists)
      throw new HttpException('EXPERIENCE_NOT_FOUND', HttpStatus.NOT_FOUND);

    const experience =
      await this.profileExperienceRepository.findExperienceByExperienceId(
        experienceId,
      );
    if (!experience)
      throw new HttpException('EXPERIENCE_NOT_FOUND', HttpStatus.NOT_FOUND);

    return await this.profileExperienceRepository.remove(experience);
  }

  async deleteProfileEducation(
    profileEducationDeleteDto: ProfileEducationDeleteDto,
  ): Promise<void> {
    const { userId, profileId, educationId } = profileEducationDeleteDto;

    const user = await this.userRepository.findOneById(userId);
    if (!user) throw new HttpException('USER_NOT_FOUND', HttpStatus.NOT_FOUND);

    const profile =
      await this.profileRepository.findProfileByProfileId(profileId);
    if (!profile)
      throw new HttpException('PROFILE_NOT_FOUND', HttpStatus.NOT_FOUND);
    if (profile.user.id !== Number(userId))
      throw new HttpException('UNAUTHORIZED', HttpStatus.UNAUTHORIZED);

    const educationsByProfileId =
      await this.profileEducationRepository.findEducationByProfileId(profileId);

    if (!educationsByProfileId)
      throw new HttpException('EDUCATION_NOT_FOUND', HttpStatus.NOT_FOUND);

    const educationExists = educationsByProfileId.some(
      (education) => education.id === educationId,
    );
    if (!educationExists)
      throw new HttpException('EDUCATION_NOT_FOUND', HttpStatus.NOT_FOUND);

    const education =
      await this.profileEducationRepository.findEducationByEducationId(
        educationId,
      );
    if (!education)
      throw new HttpException('EDUCATION_NOT_FOUND', HttpStatus.NOT_FOUND);

    return await this.profileEducationRepository.remove(education);
  }

  async deleteProfileWebsite(
    profileWebsiteDeleteDto: ProfileWebsiteDeleteDto,
  ): Promise<void> {
    const { userId, profileId, websiteId } = profileWebsiteDeleteDto;

    const user = await this.userRepository.findOneById(userId);
    if (!user) throw new HttpException('USER_NOT_FOUND', HttpStatus.NOT_FOUND);

    const profile =
      await this.profileRepository.findProfileByProfileId(profileId);
    if (!profile)
      throw new HttpException('PROFILE_NOT_FOUND', HttpStatus.NOT_FOUND);
    if (profile.user.id !== Number(userId))
      throw new HttpException('UNAUTHORIZED', HttpStatus.UNAUTHORIZED);

    const websitesByProfileId =
      await this.profileWebsiteRepository.findWebsiteByProfileId(profileId);

    if (!websitesByProfileId)
      throw new HttpException('WEBSITE_NOT_FOUND', HttpStatus.NOT_FOUND);

    const websiteExists = websitesByProfileId.some(
      (website) => website.id === websiteId,
    );
    if (!websiteExists)
      throw new HttpException('WEBSITE_NOT_FOUND', HttpStatus.NOT_FOUND);

    const website =
      await this.profileWebsiteRepository.findWebsiteByWebsiteId(websiteId);
    if (!website)
      throw new HttpException('WEBSITE_NOT_FOUND', HttpStatus.NOT_FOUND);

    return await this.profileWebsiteRepository.remove(website);
  }

  private createImageVos(images: string[]): ProjectImageVo[] {
    return images.map((item) => {
      const imageVo = new ProjectImageVo();
      imageVo.image = item;
      return imageVo;
    });
  }

  private createCategoryVos(category: string): ProjectCategoryVo {
    const categoryVo = new ProjectCategoryVo();
    categoryVo.title = category;
    return categoryVo;
  }

  private createExperienceCompany(
    company: ExperienceCompanyVo,
  ): ExperienceCompanyVo {
    const companyVo = new ExperienceCompanyVo();
    companyVo.name = company.name;
    companyVo.logo = company.logo;
    companyVo.location = company.location;

    return companyVo;
  }
}
