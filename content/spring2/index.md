---
emoji: 🙂
title: "Spring 을 사용하여 의존성을 주입할 시 생성자를 사용해야하는 이유"
date: "2022-12-22 09:00:00"
author: 수달
tags: spring 
categories: spring
---



## 학습 동기

스프링을 사용하면서 습관처럼 의존성 주입을 생성자 주입으로 받곤 했어요. 처음 접한 방식은 @Autowired 였는데 매 필드마다 달아주는게 너무 힘들었거든요. 생성자는 IDE 에서 자동 생성이 되니까 편리하게 사용이 가능하고, 필드에 final 을 붙일 수 있어 불변을 보장해줘서 더 안정적이게 느껴졌어요. 

그러다 문득 의존성을 주입하는 방식이 3가지나 있는데, 지금 방법보다 더 나은 방법은 없을까? 궁금해졌어요. 그래서 장단점을 파악해보기로 했습니다. 

> 의존성 주입이란 무엇일까요? ☺️
> 의존성 주입이란 스프링에서 제공하는 DI 기능입니다. 스프링에서는 객체를 싱글톤 빈으로 관리하고, 필요한 곳에 적절히 주입시켜주어 객체를 계속 생성해 부하가 발생하는 문제를 해결했어요!  그래서 대용량 트래픽 처리에 스프링을 사용하면 좋을 것 같다는 생각을 했습니다.


## **생성자 주입(Constructor Injection)**

- 생성시 값이 주입되기 때문에 final 키워드를 붙여 불변을 보장할 수 있어요.
- 객체를 생성자를 통해 직접 주입 시킬 수 있어 테스트 코드를 작성하기 수월해요.
- lombok 을 사용할 수 있어요!

```java
@Controller
public class HomeController {

    private final GameService gameService;

    /*
		* 스프링 초기에는 Autowired 를 사용한 의존성 주입 방식을 사용했기 때문에
		* Spring 4.3 이전 버전이면 @Autowired 필요해요. 
		*/
    public HomeController(GameService gameService) {
        this.gameService = gameService;
    }
}
```

## @Autowired 로 의존성 주입받기 (**Field Injection)**

- 객체 생성 이후 값이 주입되니까 **final 키워드를 붙일 수 없어요.**
- 필드에 @Autowired를 붙여서 사용해요.

영어로는 자동 연결 정도로 해석이 되는데요. [공식 문서](https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/beans/factory/annotation/Autowired.html)를 본다면 해당 필드에 빈 주입이 필요하다는 것을 선언함으로 runtime 중 호출 시점에 의존성이 주입된다고 하네요.  생성자 없이도 필드를 추가하고 어노테이션만 붙여주면 되어서 편리하겠네요.

![reference.png](reference.png)


## 수정자 주입 방식 (**Setter based Injection)**

- 객체 생성 이후 값이 주입되니까 **final 키워드를 붙일 수 없어요.**
- setter 메서드에 @Autowired를 붙여서 사용해요.

```java
@Service
class MemberService {

	private PointService pointService;
	
	@Autowired
	public void setPointService(PointService pointService){
	    	this.pointService = pointService;
	   }
}
```

## 문제점 - 순환참조 발생시 파악하기 어려움

**필드나 수정자로 의존성을 주입받게 되면** 우선 빈이 생성된 후, 호출되는 시점에 의존성이 필요한 객체를 주입하기 때문에 어플리케이션이 실행되고 있을 때는 순환참조 문제가 발생하지 않아요. 실제로 호출되면 서로를 계속 호출하게 될 테니까 무한 반복이 되다가 서버가 다운되겠죠? 😢

**반면, `생성자를 통해 주입`하고 실행해보면 BeanCurrentlyInCreationException이 발생하게 돼요. 순환 참조 뿐만 아니라 잘못된 의존관계도 실행 시점에 파악할 수 있어서 좋아요.**

순환 참조가 발생했다는 것은 객체간 결합도가 높아 유지보수하기 어려운 코드임을 알리는 신호에요. 이때는 설계가 잘못되진 않았는지 확인할 필요가 있어요. 

> 순환 참조 문제가 있는 코드
> 

```java
@Service
class MemberService {
   @Autowired
   private PointService pointService;

   public void sayMemberHi() {
        pointService.sayPointHi;
    }
}
```

```java
@Service
class PointService {

   @Autowired
   private MemberService memberService;

   public void sayPointHi() {
        pointService.sayMemberHi();
    }
}
```

## 어떤 방법이 제일 좋을까? 😀

장단점을 찾아보며 생성자로 의존성을 주입하는 방식이 가장 좋다고 느꼈어요. 이유는 아래와 같아요. 

### 1. 불변 객체를 보장할 수 있어요.

객체 생성시 필드 값을 초기화 하면 final 키워드를 사용해서 객체 값이 변하지 않도록 할 수 있어요. 믿고 객체를 사용할 수 있게 되어서 좋아요. 

### 2. 테스트 코드를 작성하기 용이하고, 스프링을 걷어내도 변경이 적어져요.

생성자로 의존성을 주입 받게 되면 `new PointService(넣고 싶은 객체 선언)`  와 같이  객체를 직접 넣을 수 있게 되어요. 그래서 단위 테스트나 슬라이스 테스트를 할 때 한결 수월해져요. 

또한 스프링을 걷어낸다면 의존성을 주입해주는 DI 가 없어져요! 그러면 해당 코드는 거의 모든 로직에서 변경이 일어나겠죠 .. ? 생성자가 있다면 문제 없어요! 물론 최소 한번은 어디선가 주입해줘야하지만 실제 객체 내부에는 큰 변화가 없을거예요 😝

### 3. IDE 단축키와 lombok 을 사용해서 편리하게 생성자를 만들 수 있어요!

> **lombok 이란? Java의 라이브러리로 반복되는 메소드를 Annotation 을 사용해서 자동생성 해주는 라이브러리**
> 

IDE 단축키 를 사용하면 (command + n → constructor ) 쉽게 생성자를 만들 수 있고, lombok 에 있는 ****@RequiredArgsConstructor 을 사용하면 어노테이션 하나만 붙이면 생성자가 자동으로 만들어져요!**** 

**정리!  생성자 주입 방법을 사용하면 프레임워크에 의존하지 않고, 순수 자바 언어의 특징을 제일 잘 살릴 수 있게 돼요.**  

## DI 시 **조회되는 빈이 두 개 이상일 경우는 어떤 빈이 주입될까?**

아무런 작업 없이 위에 세가지 방법만 사용할 때 , 같은 인터페이스를 상속받은 구현체가 두개일 경우 **NoUniqureBeanDefinitionException** 예외가 발생해요.  해결 방법은 두가지 정도 소개할게요!

### @Autowired 필드명 매칭

스프링에서 의존성을 주입할 때 아래과 같은 순서로 주입이 돼요. 그래서 이름으로 주입되는 객체를 지정할 수 있어요.

1) 상위 타입을 구현한 하위 타입을 전부 조회한다. 

2) 여러개일 경우 클래스 필드명과 일치하는 객체를 주입한다. 

```java
@Service
class MemberService {

	private final PointService superMartPointService;
	

	public MemberService(PointService pointService){
	    this.superMartPointService = pointService;
	 }
}
```

### @Primary 어노테이션 사용

구현체가 여러개 조회되면 Primary 어노테이션이 붙은걸 우선순위로 넣어달라고 지정할 수 있어요. 

```java
@Repository
@Primary
public class JpaRepository extends ExampleRepository {}
```

## **의존성 주입 방법을 동시에 여러개 사용한다면 어떤 방법이 사용될까?**

이런 일은 거의 없겠지만, 그냥 단순한 호기심에 의존성 주입 방법도 여러개를 쓸 수 있는데, 여러개가 사용된다면 어떤 방식이 채택될까 궁금해졌어요.  관련 글이 [스택오버 플로우](https://stackoverflow.com/questions/63826101/spring-dependency-injection-which-takes-precedence)에 있어서 확인해보니 객체가 생성되려면 생성자를 호출해야하기 때문에 `가장 먼저 생성자 주입`이 실행되고,  `그 다음으로는 필드`에 접근을 해야만 메서드 호출이 가능해지니 필드 주입, `마지막으로 메서드 주입`이 된다는 것을 발견했어요. 

```java
@Component
public class FootballCoach implements Coach {
    
    //Field Injection
    @Autowired
    private FortuneService fortuneService;
    
    //setter Injection
    @Autowired
    public void setFortuneService(FortuneService fortuneService) {
        this.fortuneService = fortuneService;
    }
    //constructor Injection
    @Autowired
    public FootballCoach(FortuneService fortuneService) {
        this.fortuneService = fortuneService;
    }
}
```

## 느낀점

- 의존성 주입은 생성자 주입 방식을 사용하는게 가장 좋다.
- 구현체가 두개일 경우 필드명이나 우선순위를 통해 구현체 선택이 가능하다
- 생성자 방식을 여러개 사용할 경우 `생성자 - 필드 - 메서드` 순으로 실행된다.

습관처럼 사용하던 생성자로 의존성 주입하는 방식보다 더 좋은 방식은 없을까? 궁금하지 않았다면 위에 학습했던 재밌는 내용을 놓쳤을 것 같아요. 모든 학습은 의식적으로 내가 선택한 방식에 근거를 찾아가며 하는게 좋겠다고 생각되네요!


## 참고자료
- [공식 문서](https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/beans/factory/annotation/Autowired.html)