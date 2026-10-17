import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { DATABASE_DATA_SOURCE } from '../database/database.module.js';
import { CreateProfileDto } from './dto/create-profile.dto.js';
import { UpdateProfileDto } from './dto/update-profile.dto.js';
import { Profile } from './entities/profile.entity.js';

@Injectable()
export class ProfileService {
  private readonly profiles: Repository<Profile>;

  constructor(
    @Inject(DATABASE_DATA_SOURCE) dataSource: DataSource,
  ) {
    this.profiles = dataSource.getRepository(Profile);
  }

  create(createProfileDto: CreateProfileDto) {
    const profile = this.profiles.create();
    profile.username = createProfileDto.username ?? 'user';
    profile.displayName = createProfileDto.displayName ?? 'user';
    return this.profiles.save(profile);
  }

  findAll() {
    return this.profiles.find({ order: { id: 'ASC' } });
  }

  async findOne(id: number) {
    const profile = await this.profiles.findOneBy({ id });
    if (!profile) {
      throw new NotFoundException(`Profile with id ${id} not found`);
    }
    return profile;
  }

  async update(id: number, updateProfileDto: UpdateProfileDto) {
    const profile = await this.findOne(id);
    Object.assign(profile, updateProfileDto);
    return this.profiles.save(profile);
  }

  async remove(id: number) {
    const profile = await this.findOne(id);
    await this.profiles.remove(profile);
  }
}
