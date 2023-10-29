---
emoji: 🙂
title: "캡슐화(Encapsulation)란?"
date: "2022-12-22 10:00:00"
author: 수달
tags: java
categories: java
---


## 캡슐화란?

> 객체의 상태와 행위를 외부로 부터 보호합니다. 주로 접근 제어자를 사용하여 구현합니다.

### 왜 캡슐화를 지켜야 하나요?

객체지향적이란, 객체 각각 역할과 책임을 다해야합니다. 

내 상태와 행위를 밖으로 노출시키게 된다면 어떻게 될까요 ?

### 캡슐화를 지킨 사례

```java
class Capsule {
    int number;
    
    public Capsule(int number) {
        this.number = number;
    }
    
    public double getHalf() {
        return number / 2;
    }
}

------------------------------------------------------

class Main {
    public static void main(String[] args) {
        Capsule capsule = new Capsule(10);
        System.out.println(capsule.getHalf());
    }
}
```

### 캡슐화가 위반된 사례

```java
class Capsule {
    int number;
    
    public Capsule(int number) {
        this.number = number;
    }
    
    public int getNumber() {
        return number;
    }
}

------------------------------------------------------

class Main {
    public static void main(String[] args) {
        Capsule capsule = new Capsule(10);
        System.out.println(capsule.getNumber() / 2D);
    }
}
```

데이터와, 행위를 하나로 묶고, 그걸 외부에 노출시키지 않는게 왜 중요한가?
아래와 같이 코드를 작성하더라도 같은 행위가 아닌가?

캡슐화를 지키기 위한 규칙중에는 `Tell, Don't Ask` 라는 원칙이 있다.
객체 내부의 데이터를 꺼내와서 처리하는게 아닌, 객체에게 처리할 행위를 요청하라는 행위이다. 이러한 행위를 우리는 "객체에 메세지를 보낸다" 라고 말한다.
그렇다면 왜 캡슐화를 지키기 위해서는 데이터를 객체로부터 받아와서 처리하면 안된다고 하는걸까? 캡슐화의 장점을 살펴보면 그 이유를 간단히 이해할 수 있다.
캡슐화를 통해 우리가 얻을 수 있는 이점중 가장 큰것은 코드의 중복을 피할 수 있다는 점과, 데이터를 처리하는 동작 방식을 외부에서 알 필요가 없다는 점이다.

**코드의 중복을 피한다는 점**과, **동작 방식을 외부에서 알 필요가 없다는 것** 또한, 객체지향을 처음 접하면 그게 왜 중요한지 이해가 안될 수 있다. 이럴때는 예제를 통한 설명이 가장 확실하다.

**어떤 물품의 10% 할인된 금액을 구해야 한다고 생각해 보자.** 만일 데이터를 객체에서 받아와서 처리를 한다면 우리는 비즈니스 로직에 다음과 같은 코드를 추가할 것이다.

```java
public void foo(Goods goods) {
    double discountedPrice = goods.getPrice() * 0.9;
    var(discountedPrice);
}
```

상품의 가격을 가지고 와서 10프로 할인된 가격을 구하고, 다른 로직으로 넘겼다. 즉, 위 코드는 데이터를 객체로 부터 받아와서 처리하는 로직을 구현하고 있다(아마 많이 본 형식의 코드일 것 이다). 그렇다면, 만일 10프로 할인된 금액을 다른 로직에서도 사용하게 된다면 어떻게 될까?

```java
public void foo(Goods goods) {
    double discountedPrice = goods.getPrice() * 0.9;
    var(discountedPrice);
}

public void foo2(Goods goods) {
    double discountedPrice = goods.getPrice() * 0.9;
    var2(discountedPrice);
}
```

코드의 중복이 일어났다. 혹자는 그거 몇줄 안되는 코드 좀 중복 나면 어때?? 라고 생각할 수 있다. 하지만 위와 같은 로직이 서비스에서 수백번 필요하다 생각해 보자... 그걸 일일이 타이핑, 혹은 복붙하는 행위는 고역일 것 이다. 또는, 코드를 작성하는 코더가 변경되었다고 했을 때, 10프로 할인 로직을 아래처럼 작성해 버릴 수도 있다.

```java
public void foo(Goods goods) {
    double discountedPrice = goods.getPrice() - goods.getPrice() * 0.1;
    var(discountedPrice);
}
```

## 그러면 데이터를 처리하는 방식의 외부에 드러나지 않는것은 어떤면에서 이점이 있을까?

```java
class Goods {
    int price = 10000;
    ...
    public int getDiscountedPrice() {
        return price * 0.9;
    }
}

public void foo(Goods goods) {
    double discountedPrice = goods.getDiscountedPrice();
    var(discountedPrice);
}
```

10프로 할인된 금액을 도출하는 로직이 객체 안으로 이동했다. 그에따라 foo()에서 할인된 금액을 생성하는 부분도, 비즈니스 로직이 10프로를 할인 하는게 아닌 Goods에게 "메세지를 보내서(메소드를 호출하여)" 데이터를 가지고 있는 Goods가 스스로 처리하도록 소스가 변경되었다.

그렇다면 이제 위에서 말했던 문제들을 다시 적용시켜 보자. 위와 같이 할인된 금액을 사용하는 로직이 수백개가 있고, 요구사항이 20프로를 할인하도록 변경됐다. 우리는 무엇을 바꾸면 되는가? getDiscountedPrice()의 로직을 수정하면 된다. 데이터를 처리하는 방식이 외부에 드러나는게 아닌, 객체 스스로 처리하도록 하니 모든 문제가 해결됐다.

# 수달이 이해한 캡슐화를 지켜야하는이유

- 코드의 중복은 변경에 취약하다.
  위에서 말한 할인 정보가 바뀌었을 때 코드가 분산되어있다면,  정책에 따라 모든 코드를 변경해주어야 할 것이다. 

- 협력하는 객체가 알아야하는 정보가 적어진다. (객체의 자율성이 보장된다)
  협력하는 객체는 단순히 메세지만 보내면 된다.