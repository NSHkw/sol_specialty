import { SetMetadata } from '@nestjs/common';
import { UserRole } from 'src/user/entities/user.entity';

// 권한 데코레이터
// 역할 기반 접근 제어를 위한 커스텀 데코레이터 정의 파일
// 데코레이터는 컨트롤러나 메소드에 추가 기능 부여
export const ROLES_KEY = 'roles'; // 메타 데이터 저장, 검색을 위해 사용되는 키 (reflector가 이 키를 사용해 메타데이터를 찾는다)

// SetMetadata는 nest에서 메타데이터를 설정하는 데 쓰는 함수 (@Roles()를 만들어낸다)
// ...roles 형태로 한 건 다른 역할의 유저들도 포함될 수 있으므로 (customer, seller 둘 다 사용 가능할 경우)
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);

// 데코레이터가 사용되는 순서
// @Roles(UserRole.ADMIN-> roles = [UserRole.ADMIN]-> SetMetadata(ROLES_KEY, [UserRole.ADMIN])
