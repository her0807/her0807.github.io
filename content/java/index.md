---
emoji: 🙂
title: "Stream의 reduce() 로 조합 계산하기"
description: ""
date: "2022-12-14 11:00:00"
author: 수달
tags: java 
categories: java
---

> 해당 글은 Stream 에 대해 알고 있다는 가정하에 작성되었습니다.
> 

## 학습 동기

프로그래머스에서 [위장](https://school.programmers.co.kr/learn/courses/30/lessons/42578) 이라는 문제를 풀다가 모든 경우의 수를 찾아보는데 조합으로 풀면 간단하겠다고 생각이 들었고, 조합을 풀면서 재귀나 반복으로 풀기보다 Java Stream 에서 제공하는 기능으로 문제를 풀어보면 좋겠다고 생각되었습니다. 해당 글은 Stream 에 대해 알고 있다는 가정하에 작성되었습니다. 

## Reduce() 란?

반복된 패턴을 추상화 할 수 있는 강력한 기능입니다. 스트림의 특성상  for 문처럼 원소들이 하나씩 아래로 들어오게 되는데요.  `reduce()`는 스트림의 원소들을 하나씩 소모해가며, 누적 계산을 수행하고 결과값을 리턴하는 메서드 입니다. 

`reduce()`는 파라미터를 3개 받을 수 있어요. 

- `T identity`: 계산에 적용할 초깃값으로, 스트림이 비어 있더라도 초깃값을 반환
    
    만약에 값을 누적하면서 곱하고 싶다면 기본 값이 1이어야 하겠죠?
    
- `BinaryOperator<T> accumulator`: 적용할 계산 함수
    
    더하거나, 곱하거나, 빼거나 이런 연산을 수행해요.
    
- `BinaryOperator<U> combiner`: 병렬 스트림에서 각 쓰레드 계산 결과를 합치는 함수
    
    `accumulator` 를 통해 나온 값을 누적해요. 
    

## 문제 상황

스파이가 위장을 하기 위해서 `모자`(비니, 나이키 엘로우 캡),  `아우터`(가죽자켓, 후드티), `양말`(빨간색, 파란색, 노란색) 이 있다고 할 때, 하루에 각 종류별로 1개 이상 착용해야하고, 동일한 종류의 의류를 착용할 수 없다는 제약 조건이 있었어요. 그래서 모든 경우의 수를 찾아야 했어요. 

- 만약에 옷의 종류가 1개라고 해본다면  총 a가지의 경우가 있겠죠?
- 종류가 2개가 되고 각각의 옷의 개수는 a, b개입니다
    
    그럼 경우의 수는 a, b, ab가 되므로 조합의 개수는 (a+b) + (ab)가지입니다.
    
- 3개가 된다면? (a+b+c) + (ab+bc+ca) + (abc)가지입니다.

이런 문제 풀이는 다항식을 적용해볼 수 있어요. 

(x+a)(x+b)(x+c) = x3 + (a+b+c)x2 + (ab+bc+ca)x + (abc)라는 식을 도출할 수 있습니다. 

해당 식의 계수의 합을 구하려면 x=1을 대입해주면 됩니다. 그 후 맨 앞 x3 의 계수는 정답에 포함되지 않으므로 마지막에 1을 빼주면 됩니다. .x=1을 대입한 식은 `(1+a)(1+b)(1+c)`가 되고 그 값에 1을 빼면 모든 경우의 수가 나오게 됩니다! 

### 사용한 reduce 2개 파라미터 메서드

### `T reduce(T identity, BinaryOperator<T> accumulator)`

결과의 초깃값을 `identity`로 설정한 후, 스트림의 모든 `element`를 차례로 돌면서 `accumulator`를 적용하며 `result`를 갱신합니다. .스트림이 비어 있어도 초깃값인 `identity`를 반환합니다.

```java
T result = identity;
for (T element : this stream)
    result = accumulator.apply(result, element)
return result;
```

사용 예시는 아래와 같다.

```java
int result = IntStream.of(3, 4, 5)
    .reduce(1, (a,b) -> a*b);	// 결과값은 60 이다. 
```

## HashMap 과 조합을 사용할 때는?

주어진 데이터가 String, 문자열 배열 이더라도,  key 값에는 고유 값을 두고,  value 에  배열의 개수를 두면 조합을 통해서 값을 계산하기 한결 수월해집니다! 

```java
public static int solution(String[][] clothes) { // 문자열 배열로 주어진 데이터
		.
		Map<String, Integer> total = new HashMap<>();
		for (int i = 0; i < clothes.length; i++) {
			total.put(clothes[i][1], total.getOrDefault(clothes[i][1], 1) + 1);
		}

		final Collection<Integer> values = total.values();
		int answer = values.stream().reduce(1, (a, b) -> a*b) - 1;
		return answer;
	}
```