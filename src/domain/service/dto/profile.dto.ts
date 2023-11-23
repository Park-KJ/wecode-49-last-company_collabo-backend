import { EducationInstituteVo } from 'src/infra/data/typeorm/vo/education_institute.vo';
import { ExperienceCompanyVo } from 'src/infra/data/typeorm/vo/experience_company.vo';

export type ProfileDto = {
  userId: number;
  jobDescription?: string;
  about?: string;
  location?: string;
  address?: string;
  profileBackImage?: string;
};

export type ProfileProjectDto = {
  userId: number;
  title: string;
  description?: string;
  startDate: Date;
  endDate?: Date | null;
  projectImages: string[];
  projectCategory?: string;
};

export type ProfileExperienceDto = {
  userId: number;
  position: string;
  description?: string;
  startDate: Date;
  endDate?: Date | null;
  experienceCompany?: ExperienceCompanyVo;
};

export type ProfileEducationDto = {
  userId: number;
  course: string; // 학과, 전공 설명 입력
  description?: string; // 추가 정보
  startDate: Date;
  endDate?: Date | null;
  educationInstitute: EducationInstituteVo;
};

export type ProfileWebsiteDto = {
  userId: number;
  type: string;
  url: string;
};

export type ProfileDeleteDto = {
  userId: number;
  profileId: number;
};

export type ProfileProjectDeleteDto = ProfileDeleteDto & {
  projectId: number;
};

export type ProfileExperienceDeleteDto = ProfileDeleteDto & {
  experienceId: number;
};

export type ProfileEducationDeleteDto = ProfileDeleteDto & {
  educationId: number;
};

export type ProfileWebsiteDeleteDto = ProfileDeleteDto & {
  websiteId: number;
};
