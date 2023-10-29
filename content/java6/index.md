---
emoji: 🙂
title: "[Effective Java -14장] Comparable 을 구현할지 고려해라"
date: "2022-12-16 11:52:00"
author: 수달
tags: Effective java
categories: cs 개발독서
---



## 학습 동기

정렬 알고리즘에 대해서 공부하다가 Arrays.sort 내부 구현체는 Comparable 을 상속받아 구현되어 있다는 내용을 알게 되었습니다.  Comparable 의 특징과 동작원리를 알게되면 더욱 효과적으로 사용할 수 있을 것 같아서 읽게 되었어요. 

## Comparable

 자바에서 제공되는 정렬이 가능한 클래스들은 모두 Comparable 인터페이스를 구현하고 있으며, 정렬 시에 이에 맞게 정렬이 수행됩니다. 

```java
// Integer Class
public final class Integer extends Number implements Comparable<Integer> { ... }
// String Class
public final class String implements java.io.Serializable, Comparable<String>, CharSequence { ... }
```

- Integer 와 Double 클래스는 숫자 오름차순으로 정렬되어 있어요.
    
    ```java
    public static int compare(int x, int y) {
            return (x < y) ? -1 : ((x == y) ? 0 : 1);
        }
    ```
    

- String은  A-Z, 1-9 같이 사전순으로 정렬되어 있어요.
    
    ```java
    public int compareTo(String anotherString) {
            byte v1[] = value;
            byte v2[] = anotherString.value;
            if (coder() == anotherString.coder()) {
                return isLatin1() ? StringLatin1.compareTo(v1, v2)
                                  : StringUTF16.compareTo(v1, v2);
            }
            return isLatin1() ? StringLatin1.compareToUTF16(v1, v2)
                              : StringUTF16.compareToLatin1(v1, v2);
         }
    ```
    

### 유일무이한 메서드 compareTo

해당 인터페이스에는 메서드가 compareTo 딱 하나뿐이에요. 이 compareTo 를 재정의해서 정렬 조건을 사용할 의도에 맞춰서 변경할 수 있어요!

- 비교 값이 0 이면 같다.
- 비교 값이 1 (양수) 이면 크다.
- 비교 값이 -1 (음수) 이면 작다.

`기본 값은 오름차순` 정렬이고, 비교군을 반대로 한다면 내림차순으로 정의할 수도 있어요. 

```java
@Override
public int compareTo(other o1) {
	return o1.id - this.id 
}
```

### compareTo 와 Equals 의 차이가 뭐지?

가장 큰 차이는 비교 타입이 달라도 된다는 것입니다. equals 는 비교하는 타입이 같아야 하지만, compareTo는  보통 비교할 객체들이 구현한 공통 인터페이스를 매개로 전달받아 비교를 진행하게됩니다. 또한 compreTo 는 단순 동치성 비교에 더해 순서 비교까지 할 수 있으며 제네릭합니다. 

> 동치성이란 같다는 의미로 동등성과도 거의 같은 의미로 쓰이는 것 같아요. 두 개의 객체가 같은 정보를 가지고 있는 경우를 의미합니다.

### compareTo 규칙

- 두 객체의 참조 순서를 바꿔도 예상한 결과가 나와야한다.
- 반사성, 대칭성, 추이성을 지켜야한다.

### 권고 사항

compareTo 로 실행한 결과가 equals 결과와 같게 하면 좋아요. 물론 결과가 일관되지 않은 compareTo 도 여전히 동작은 하지만, 인터페이스(Set, Map) 동작과 다르게 동작할 수도 있어요. 이 인터페이스는 equals 를 기반으로 동작한다고 되어 있지만, 놀랍게도 정렬된 컬렉션들은 동치성을 비교할 때 compareTo 를 사용하기 때문이에요. 

- BigDecimal 타입 같은 경우는 내부에서 compareTo 와 equals 를 다른 기준으로 재정의 해두었어요. 그래서 해당 컬렉션에서 정렬을 하게되면 일관되지 못한 반환값이 나올거에요 ㅠㅠ

### 클래스에 구현한 compareTo

클래스에 핵심 필드가 여러개라면 어느 것을 먼저 비교하냐가 중요해져요. 가장 핵심 필드부터 비교하세요! 비교 결과가 0이 아니라면 즉시 반환하면 됩니다. 거기서 순서가 바로 정해졌기 때문이죠 ㅎ

```java
public int compareTo(PhoneNumber pn) {
		int result = Short.compare(areaCode.areaCode);
		if(result == 0){
		result = Short.compare(prefix, pn.prefix);
		}
		if(result == 0){
		result = Short.compare(line, pn.line);
		}
		return result;

}
```


자바8 부터는 Comparator 인터페이스가 일련의 비교자 생성 메서드와 팀을 꾸려 메서드 연쇄 방식으로 비교자를 생성할 수 있게 되었어요. 그러나 이 방식은 약간의 성능 저하가 뒤따릅니다. 아 추가로 자바의 정적 임포트 기능을 이용하면 그 이름만으로 사용할 수 있어 코드가 훨씬 깔끔해집니다 ☺️


```java
private static final Comparator<PhoneNumber> C =
			comparingInt((PhoneNumber pn) pn.areaCode)
				.thenComparingInt(pn -> pn.prefix)
				.thenComparingInt(pn -> pn.lineNum);

public int compareTo(PhoneNumber){  // 엄청 간결!
		return C.compre(this,pn);
}
```

이 코드는 람다를 인수로 받으며 위에는 조건 분기문을 계속 만들었지만, 여기서는 thenComparingInt(조건 함수)를 사용하여 `분기문을 줄이고` 하나의 메소드를 재사용하여 여러 조건으로 비교하여 순서를 결정할 수 있게 되었습니다. 훨씬 간결해졌죠?! 타입 또한 최초 한번은 타입을 명시해주고, 그 뒤에서부터는 자바에서 알아서 추론이 가능해집니다. 


### 해시 코드 값으로 비교는 금물!!!

이 방식은 정수 오버 플로를 일으키거나 IEEE 754 부동소수점 계산방식에 따른 오류를 낼 수 있어요

```java
public int compre(Object o1, Object o2) {
		return o1.hashCode() - o2.hashCode();
}
```

## 간단한 사용 방법

- Arrays.sort(array);
- Collections.sort(list);



### 타입에 따른 Arrays.sort() 의 신기한 내부 알고리즘

- double[], int[] 등 Object Arrays 에서는 `TimSort` 를 사용한다.
    
    Merge Sort 와 Insertion Sort 를 사용합니다 ㅎㅎ
    
- 새로 정의한 클래스 배열은 `Dual PivotQuicSort`를 사용한다.
    
    DualPivotQuicSort 는 Quick sort + insertion sort 를 사용해요. 
    
- `List Collection`의 경우 `내부적으로 Arrays.sort` 를 사용하고 있어요.



## Comparator 랑 차이가 뭔데?

기본 정렬 기준과 다르게 정렬하고 싶을 때 사용하는 인터페이스 입니다. 내부에 내림차순 정렬이나 다양한 조건의 정렬이 구현되어 있습니다. 

### 사용 방법

Compareator 내부에 선언되어 있는 정적 메서드를 호출해서 정렬시 조건문을 넣어주는 매개변수에 전달하면 됩니다. ☺️

## 정리 💪🏻

순서를 고려해야 하는 값 클래스를 작성한다면 꼭 Comparable 인터페이스를 구현하여 그 인스턴스들을 쉽게 정렬하고, 검색하고, 비교 기능을 제공하는 컬렉션과 어우러지도록 해야한다 compareTo 메서드에서 필드의 값을 비교할 때 and 연산자는 쓰지말자. 그대신 박싱된 기본 타입 클래스가 제공하는 정적메서드 compare 이나 Comparator 인터페이스가 제공하는 비교자 생성 메서드를 사용하자. 

## 느낀점

자바에서 기본적으로 제공하는 기능들을 가져다 사용하는 것 뿐만 아니라 내부 구현과 그 구현에 시간복잡도, 구현 알고리즘을 살펴보니 같은 기능이더라도 구현 방식이 달라서 효율성을 따져 볼 때 좋은 선택 기준이 될 것 같아요.

## 참고

- 구현체 코드
- [Collections.sort javadoc](https://docs.oracle.com/javase/7/docs/api/java/util/Collections.html#:~:text=emptyMap()-,Method%20Detail,-sort)
- [comparable 과 Comparator 차이 블로그 글](https://gmlwjd9405.github.io/2018/09/06/java-comparable-and-comparator.html)