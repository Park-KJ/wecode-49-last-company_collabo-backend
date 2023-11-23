import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Post,
  HttpException,
  HttpStatus,
  UseGuards,
  Delete,
  Put,
} from '@nestjs/common';

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
} from 'src/domain/service/dto/profile.dto';
import { PROFILE_SERVICE } from 'src/domain/service/ioc';
import { IProfileService } from 'src/domain/service/profile/profile.service.interface';
import { ProfileVo } from 'src/infra/data/typeorm/vo/profile.vo';
import { ProfileEducationVo } from 'src/infra/data/typeorm/vo/profile_education.vo';
import { ProfileExperienceVo } from 'src/infra/data/typeorm/vo/profile_experience.vo';
import { ProfileProjectVo } from 'src/infra/data/typeorm/vo/profile_project.vo';
import { ProfileWebsiteVo } from 'src/infra/data/typeorm/vo/profile_website.vo';
import { AuthUser } from 'src/domain/interactor/decorator/auth.decorator';
import { AuthGuard } from 'src/domain/interactor/guard/auth.guard';

@Controller('/profile')
@UseGuards(AuthGuard)
export class ProfileController {
  constructor(
    @Inject(PROFILE_SERVICE) private readonly profileService: IProfileService,
  ) {}

  @Get('/profileId')
  async getProfileId(@AuthUser() userId: number): Promise<ProfileVo | null> {
    return await this.profileService.getProfileId(userId);
  }

  @Get('/user/:userId') // 선택한 유저(프로필 클릭)의 profileId 검색
  async getProfileByUserId(
    @Param('userId') userId: number,
  ): Promise<ProfileVo | null> {
    return await this.profileService.getProfileId(Number(userId));
  }

  @Get('/:profileId')
  async getUserProfile(
    @Param('profileId') profileId: number,
  ): Promise<ProfileVo | null> {
    return await this.profileService.getUserProfile(profileId);
  }

  @Get('/:profileId/project')
  async getProfileProject(
    @Param('profileId') profileId: number,
  ): Promise<ProfileProjectVo[] | null> {
    return await this.profileService.getProfileProject(profileId);
  }

  @Get('/:profileId/project/:projectId')
  async getOneProfileProjectByProjectId(
    @AuthUser() userId: number,
    @Param('profileId') profileId: number,
    @Param('projectId') projectId: number,
  ): Promise<ProfileProjectVo | null> {
    return await this.profileService.getOneProfileProjectByProjectId(
      Number(userId),
      Number(profileId),
      Number(projectId),
    );
  }

  @Get('/:profileId/experience')
  async getProfileExperience(
    @Param('profileId') profileId: number,
  ): Promise<ProfileExperienceVo[] | null> {
    return await this.profileService.getProfileExperience(profileId);
  }

  @Get('/:profileId/experience/:experienceId')
  async getOneProfileExperienceByExperienceId(
    @Headers('authorization') token: string,
    @Param('profileId') profileId: number,
    @Param('experienceId') experienceId: number,
  ): Promise<ProfileExperienceVo | null> {
    const decodedToken = this.verifyToken(token);
    const userId = decodedToken.aud;
    return await this.profileService.getOneProfileExperienceByExperienceId(
      Number(userId),
      Number(profileId),
      Number(experienceId),
    );
  }

  @Get('/:profileId/education')
  async getProfileEducation(
    @Param('profileId') profileId: number,
  ): Promise<ProfileEducationVo[] | null> {
    return await this.profileService.getProfileEducation(profileId);
  }

  @Get('/:profileId/education/:educationId')
  async getOneProfileEducationByEducationId(
    @Headers('authorization') token: string,
    @Param('profileId') profileId: number,
    @Param('educationId') educationId: number,
  ): Promise<ProfileEducationVo | null> {
    const decodedToken = this.verifyToken(token);
    const userId = decodedToken.aud;
    return await this.profileService.getOneProfileEducationByEducationId(
      Number(userId),
      Number(profileId),
      Number(educationId),
    );
  }

  @Get('/:profileId/website')
  async getProfileWebsite(
    @Param('profileId') profileId: number,
  ): Promise<ProfileWebsiteVo[] | null> {
    return await this.profileService.getProfileWebsite(profileId);
  }

  @Post()
  async createProfile(
    @AuthUser() userId: number,
    @Body() body: Partial<ProfileDto>,
  ): Promise<void> {
    const profileDto: ProfileDto = {
      userId: userId,
      jobDescription: body.jobDescription,
      about: body.about,
      location: body.location,
      address: body.address,
      profileBackImage: body.profileBackImage,
    };
    return await this.profileService.createProfile(profileDto);
  }

  @Post('/:profileId/project')
  async createProfileProject(
    @AuthUser() userId: number,
    @Param('profileId') profileId: number,
    @Body() body: Partial<ProfileProjectDto>,
  ): Promise<void> {
    if (!body.title || !body.startDate)
      throw new HttpException('KEY_ERROR', HttpStatus.BAD_REQUEST);
    const profileProjectDto: ProfileProjectDto = {
      userId: userId,
      title: body.title!,
      description: body.description,
      startDate: body.startDate!,
      endDate: body.endDate,
      projectImages: body.projectImages,
      projectCategory: body.projectCategory,
    };

    return await this.profileService.createProfileProject(
      profileProjectDto,
      profileId,
    );
  }

  @Post('/:profileId/experience')
  async createProfileExperience(
    @AuthUser() userId: number,
    @Param('profileId') profileId: number,
    @Body() body: Partial<ProfileExperienceDto>,
  ): Promise<void> {
    if (!body.position || !body.startDate)
      throw new HttpException('KEY_ERROR', HttpStatus.BAD_REQUEST);
    const profileExperienceDto: ProfileExperienceDto = {
      userId: userId,
      position: body.position!,
      description: body.description,
      startDate: body.startDate!,
      endDate: body.endDate,
      experienceCompany: body.experienceCompany,
    };

    return await this.profileService.createProfileExperience(
      profileExperienceDto,
      profileId,
    );
  }

  @Post('/:profileId/education')
  async createProfileEducation(
    @AuthUser() userId: number,
    @Param('profileId') profileId: number,
    @Body() body: Partial<ProfileEducationDto>,
  ): Promise<void> {
    if (!body.course || !body.startDate)
      throw new HttpException('KEY_ERROR', HttpStatus.NOT_FOUND);
    const profileEducationDto: ProfileEducationDto = {
      userId: userId,
      course: body.course!, // 학과, 전공 설명 입력
      description: body.description, // 추가 정보
      startDate: body.startDate!,
      endDate: body.endDate,
      educationInstitute: body.educationInstitute!,
    };
    return await this.profileService.createProfileEducation(
      profileEducationDto,
      profileId,
    );
  }

  @Post('/:profileId/website')
  async createProfileWebsite(
    @AuthUser() userId: number,
    @Param('profileId') profileId: number,
    @Body() body: Partial<ProfileWebsiteDto>,
  ): Promise<void> {
    if (!body.type || !body.url)
      throw new HttpException('KEY_ERROR', HttpStatus.BAD_REQUEST);
    const profileWebsiteDto: ProfileWebsiteDto = {
      userId: userId,
      type: body.type!,
      url: body.url!,
    };

    return await this.profileService.createProfileWebsite(
      profileWebsiteDto,
      profileId,
    );
  }

  @Put('/:profileId')
  async updateProfile(
    @AuthUser() userId: number,
    @Param('profileId') profileId: number,
    @Body() body: Partial<ProfileDto>,
  ): Promise<void> {
    const profileUpdateDto: ProfileDto = {
      ...body,
      userId: userId,
    };
    return await this.profileService.updateProfile(profileUpdateDto, profileId);
  }

  @Put('/:profileId/project/:projectId')
  async updateProfileProject(
    @AuthUser() userId: number,
    @Param('profileId') profileId: number,
    @Param('projectId') projectId: number,
    @Body() body: Partial<ProfileProjectDto>,
  ): Promise<void> {
    const profileProjectUpdateDto: ProfileProjectDto = {
      title: body.title!,
      description: body.description,
      startDate: body.startDate!,
      endDate: body.endDate,
      projectImages: body.projectImages,
      projectCategory: body.projectCategory,
      userId: userId,
    };
    return await this.profileService.updateProfileProject(
      profileProjectUpdateDto,
      Number(profileId),
      Number(projectId),
    );
  }

  @Put('/:profileId/experience/:experienceId')
  async updateProfileExperience(
    @AuthUser() userId: number,
    @Param('profileId') profileId: number,
    @Param('experienceId') experienceId: number,
    @Body() body: Partial<ProfileExperienceDto>,
  ): Promise<void> {
    const profileExperienceUpdateDto: ProfileExperienceDto = {
      position: body.position!,
      description: body.description,
      startDate: body.startDate!,
      endDate: body.endDate,
      experienceCompany: body.experienceCompany,
      userId: userId,
    };
    return await this.profileService.updateProfileExperience(
      profileExperienceUpdateDto,
      Number(profileId),
      Number(experienceId),
    );
  }

  @Put('/:profileId/education/:educationId')
  async updateProfileEducation(
    @AuthUser() userId: number,
    @Param('profileId') profileId: number,
    @Param('educationId') educationId: number,
    @Body() body: Partial<ProfileEducationDto>,
  ): Promise<void> {
    const profileEducationUpdateDto: ProfileEducationDto = {
      course: body.course!,
      description: body.description,
      startDate: body.startDate!,
      endDate: body.endDate,
      educationInstitute: body.educationInstitute!,
      userId: userId,
    };

    return await this.profileService.updateProfileEducation(
      profileEducationUpdateDto,
      Number(profileId),
      Number(educationId),
    );
  }

  @Put('/:profileId/website/:websiteId')
  async updateProfileWebsite(
    @AuthUser() userId: number,
    @Param('profileId') profileId: number,
    @Param('websiteId') websiteId: number,
    @Body() body: Partial<ProfileWebsiteDto>,
  ): Promise<void> {
    const profileWebsiteUpdateDto: ProfileWebsiteDto = {
      type: body.type!,
      url: body.url!,
      userId: userId,
    };
    return this.profileService.updateProfileWebsite(
      profileWebsiteUpdateDto,
      Number(profileId),
      Number(websiteId),
    );
  }

  @Delete('/:profileId/project/:projectId')
  async deleteProfileProject(
    @AuthUser() userId: number,
    @Param('profileId') profileId: number,
    @Param('projectId') projectId: number,
  ): Promise<void> {

    const profileProjectDeleteDto: ProfileProjectDeleteDto = {
      userId: userId,
      profileId: Number(profileId),
      projectId: Number(projectId),
    };

    return await this.profileService.deleteProfileProject(
      profileProjectDeleteDto,
    );
  }

  @Delete('/:profileId/experience/:experienceId')
  async deleteProfileExperience(
    @AuthUser() userId: number,
    @Param('profileId') profileId: number,
    @Param('experienceId') experienceId: number,
  ): Promise<void> {

    const profileExperienceDeleteDto: ProfileExperienceDeleteDto = {
      userId: userId,
      profileId: Number(profileId),
      experienceId: Number(experienceId),
    };

    return await this.profileService.deleteProfileExperience(
      profileExperienceDeleteDto,
    );
  }

  @Delete('/:profileId/education/:educationId')
  async deleteProfileEducation(
    @AuthUser() userId: number,
    @Param('profileId') profileId: number,
    @Param('educationId') educationId: number,
  ): Promise<void> {
    const profileEducationDeleteDto: ProfileEducationDeleteDto = {
      userId: userId,
      profileId: Number(profileId),
      educationId: Number(educationId),
    };
    return await this.profileService.deleteProfileEducation(
      profileEducationDeleteDto,
    );
  }

  @Delete('/:profileId/website/:websiteId')
  async deleteProfileWebsite(
    @AuthUser() userId: number,
    @Param('profileId') profileId: number,
    @Param('websiteId') websiteId: number,
  ): Promise<void> {
    const profileWebsiteDeleteDto: ProfileWebsiteDeleteDto = {
      userId: userId,
      profileId: Number(profileId),
      websiteId: Number(websiteId),
    };
    return await this.profileService.deleteProfileWebsite(
      profileWebsiteDeleteDto,
    );
  }
}
