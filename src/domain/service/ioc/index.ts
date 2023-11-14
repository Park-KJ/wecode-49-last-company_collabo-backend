import { Provider } from '@nestjs/common';

import { FeedServiceImpl } from '../feed/impl/feed.service.implement';
import { UserServiceImpl } from '../user/impl/user.service.implement';
import { ProfileServiceImpl } from '../profile/impl/profile.service.implement';
import { IFeedService } from '../feed/feed.service.interface';
import { IUserService } from '../user/user.service.interface';
import { IProfileService } from '../profile/profile.service.interface';

export const FEED_SERVICE = Symbol.for('FEED_SERVICE');
export const FeedService: Provider<IFeedService> = {
  provide: FEED_SERVICE,
  useClass: FeedServiceImpl,
};

export const USER_SERVICE = Symbol.for('USER_SERVICE');
export const UserService: Provider<IUserService> = {
  provide: USER_SERVICE,
  useClass: UserServiceImpl,
};

export const PROFILE_SERVICE = Symbol.for('PROFILE_SERVICE');
export const ProfileService: Provider<IProfileService> = {
  provide: PROFILE_SERVICE,
  useClass: ProfileServiceImpl,
};
