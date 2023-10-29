---
emoji: 🙂
title: "SpringBootTest 에서 의존성 주입 방식이 @autowired 로 강제되는 이유"
date: "2022-12-12 18:00:00"
author: 수달
tags: spring
categories: spring
---

## 학습동기

prolog project test code 를 작성하다가 생성자 주입과 autowired 로 의존성 주입을 하는 방식 모두를 사용하고 있는 코드를 발견했어요. 왜 junit 을 사용하는 test 에서 두개의 의존성 주입 방식을 사용하게 된걸까요?  이전부터 궁금했던건데 테스트 코드에서는 의존성 주입 방식을 무조건 autowired 로 해야하는지도 의문이 들었어요. 

## 문제 코드

```java
@TestConstructor(autowireMode = TestConstructor.AutowireMode.ALL)
@NewIntegrationTest
class KeywordServiceTest {

    private KeywordService keywordService;
    private SessionRepository sessionRepository;
    private KeywordRepository keywordRepository;
    private EntityManager em;

    public KeywordServiceTest(final KeywordService keywordService,
                              final SessionRepository sessionRepository,
                              final KeywordRepository keywordRepository,
                              final EntityManager em) {
        this.keywordService = keywordService;
        this.sessionRepository = sessionRepository;
        this.keywordRepository = keywordRepository;
        this.em = em;
    }
```

## 결론부터 말씀드리자면 TestClass 에서는 하나의 의존성 주입 방식을 사용하고 있어요.

테스트 코드를 작성하기 위해 사용하는 라이브 러리인 Junit 에서는 스프링과 별개로 의존성 주입을 하고 있어요.그래서 위 코드에서 생성자를 만든건 생성자로 의존성을 주입하기 위해서가 아니었더라구요. 각각 @autowired 를 달아주는 번거로움을 해소하고자 `@TestConstructor(autowireMode = TestConstructor.AutowireMode.*ALL*)`  어노테이션으로 생성자 위에 autowired 를 달아준 것과 같은 효과를 내기 위해서 였어요. 

@autowired 로 의존성을 주입하지 않으면 `ParameterResolutionException`  이 발생해요.  이유는  JUnit Engine의 **Parameter Resolver 인터페이스에 의해 의존성 주입이 되기 때문인데요.** 

## **Parameter Resolver**

어뎁터 페턴을 사용하여 상황별로 맞는 리졸버를 가리기 위한 인터페이스 입니다. 

@SpringBootTest 에서 있는 SpringExtension.class 가 바로 **Parameter Resolver  를 상속받아 구현되어 있어요.** 

```java
public class SpringExtension implements ...ParameterResolver {
```

그리고 하위에 있는 supportsParameter 메서드에서는 isAutowirableConstructor 메서드로 어노테이션을 확인하구요.

```java
public boolean supportsParameter(ParameterContext parameterContext, ExtensionContext extensionContext) {
  ...
     return TestConstructorUtils.isAutowirableConstructor(executable, testClass, junitPropertyProvider) || ApplicationContext.class.isAssignableFrom(parameter.getType()) || this.supportsApplicationEvents(parameterContext) || ParameterResolutionDelegate.isAutowirable(parameter, parameterContext.getIndex());
 }
```

더 내부에서는 testConstructor 를 통해서도 Autowired 를 확인해줍니다!

```java
public static boolean isAutowirableConstructor(Constructor<?> constructor, Class<?> testClass, @Nullable PropertyProvider fallbackPropertyProvider) {
  if (AnnotatedElementUtils.hasAnnotation(constructor, Autowired.class)) {
      return true;
  } else {
      AutowireMode autowireMode = null;
      TestConstructor testConstructor = (TestConstructor)TestContextAnnotationUtils.findMergedAnnotation(testClass, TestConstructor.class);
      if (testConstructor != null) {
          autowireMode = testConstructor.autowireMode();
      } else {
          String value = SpringProperties.getProperty("spring.test.constructor.autowire.mode");
          autowireMode = AutowireMode.from(value);
          if (autowireMode == null && fallbackPropertyProvider != null) {
              value = fallbackPropertyProvider.get("spring.test.constructor.autowire.mode");
              autowireMode = AutowireMode.from(value);
          }
      }

      return autowireMode == AutowireMode.ALL;
  }
}
```

## 왜 Junit 5은 생성자 의존성 주입을 못할까?

> Jupiter vs Spring 환경 차이 때문에!
> 
- 스프링 프레임워크의 경우 **Spring Ioc 컨테이너**가 등록할 **Bean** 들을 먼저 찾아서 보관하고 있어요
    - 이후 생성자 주입을 요구하는경우, 적절한 Bean을 찾아서 생성자 주입을 수행하게 돼요
- 테스트 프레임 워크의 경우 생성자 매개 변수 관리를 **Jupiter**가 하게됩니다
- 생성자 주입을 요구하는경우, 생성자 매개변수를 처리할 **ParameterResolver**을 열심히 뒤져보게 되지만, 해당 빈은 스프링이 가지고 있기때문에 처리하지 못하게돼요
    - 이 때문에 **나 못찾았어!** 하고, `ParameterResolutionException` 에러가 발생하게 되는거죠!
- 하지만 `@AutoWired` 어노테이션을 달아 명시해 주게 된다면, **Jupiter**가 빈 주입을 **스프링 컨테이너**에게 요청하게 되어서, 정상적으로 빈 주입을 받을 수 있게돼요 ㅎㅎ

## 왜 왜 Junit 을 사용해서 테스트를 짜야할까?

그렇다면 처음부터 스프링과 자바만으로 테스트 코드를 짜면 되지 않나? 라는 생각이 드는데요! 자바로만 테스트 코드를 짜면 어플리케이션을 실행시켜야하고, 잘 테스트가 되었는지 단위별로 확인이 가능할까요? 가능할 수도 있지만 정말 힘들 거예요. 학부생 시절 때 `system.out.println()` 을 사용해서 콘솔에 데이터를 찍어가며 하나 하나 확인 했던 적이 있었는데 진짜 힘들었거든요.. 

그래서 이런 문제를 해소하기 위해서 JUnit 에서는 단위별로 프로그램을 실행하고, 검증하고, 결과를 반환하는 인련의 기능들을 구현하고 있는데요 ! 가장 큰 특징은 아래와 같아요. ☺️

- 단정 문으로 테스트 케이스의 수행 결과를 판별함(assertEquals(예상 값, 실제 값))
- JUnit4부터는 어노테이션으로 간결하게 테스트를 지원함
- 결과는 `성공(녹색), 실패(붉은색) 중 하나로 표시`

## 느낀점

단위 테스트가 가능해진 덕분에 안정한 코드와 리팩터링하기 무서운 마음을 해소할 수 있다는 것을 느껴요.  **이런 기능을 제공하기 위해서 Jupiter가  Spring Bean 을 직접 관리하지 못하고  Spring 에게 요청해야하는 인련의 과정이 있다는것을 알게되며 정말 즐거웠어요!** 직접 빈을 주입시키지 못하기 때문에 필드 각각 autowired 를 해줘야하는 상황을 개선하기 위해 `@TestConstructor`  과 같은 기능들을 만든 것을 보면서 불편한 상황에서 개선점을 찾기 위한 자세도 너무 좋았어요. 

## 참고 자료

- [공식문서](https://junit.org/junit5/docs/current/user-guide/#writing-tests-dependency-injection)
- [관련 블로그](https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/test/context/TestConstructor.html)