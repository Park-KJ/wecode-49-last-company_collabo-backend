import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { ProfileProjectVo } from './profile_project.vo';

@Entity({
  name: 'project_image',
})
export class ProjectImageVo extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
    length: 2000,
    // default: '',
  })
  image: string;

  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
    onUpdate: 'CURRENT_TIMESTAMP(6)',
  })
  updatedAt: Date;

  @ManyToOne(() => ProfileProjectVo, { onDelete: 'CASCADE' })
  @JoinColumn({
    name: 'projectId', // foreign key 이름
    referencedColumnName: 'id', // 외래 키가 참조할 column
  })
  project: ProfileProjectVo;
}
