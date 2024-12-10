@InjectRepository()
Nest에서 TypeOrm의 repository에 의존성 주입을 하기 위해 사용되는 데코레이터

> ex) @InjectRepository(User) private readonly userRepository: Repository<User>의 경우
> User 엔티티에 대한 repository를 주입시킨다

typeorm의 repository 패턴을 nestjs의 의존성 주입 시스템과 통합시킨다
(repository의 인스턴스를 만들어서 그 인스턴스에 데이터를 저장시키고, 그 인스턴스를 원래의 repository에 집어넣는 방식-> 깃허브랑 거의 같은 방식이다)
