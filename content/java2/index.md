---
emoji: 🙂
title: "ArrayList 가 동적으로 사이즈가 늘어나는 동작 원리!"
date: "2022-12-16 09:00:00"
author: 수달
tags: java cs 자료구조
categories: cs
---

## 학습 동기

알고리즘 문제를 풀면서 배열과 ArrayList 의 가장 큰 차이는 메모리가 고정되어 있는지, 동적으로 늘어나는지에 따라 상황에 맞게 사용했었습니다. 그런데 문득 ArrayList 도 내부는 배열로 되어 있는데 어떤 방식으로 사이즈가 동적으로 늘어날까 궁금해졌습니다. 

## ArrayList 내부 구조

최초에는 빈 배열로 생성되었다가 add 가 한번이라도 생성 되는 시점에 빈 배열이라면 기본 값인 10으로 사이즈 설정을 해줍니다. 

그리고 원소의 개수가 10을 넘었을 때, 해당 배열의 사이즈의 절반만큼 크기를 늘려주고 있습니다. 

```java
private static final int DEFAULT_CAPACITY = 10;

public ArrayList() {
        this.elementData = DEFAULTCAPACITY_EMPTY_ELEMENTDATA;

private int newCapacity(int minCapacity) {
        // overflow-conscious code
       ...
        if (newCapacity - minCapacity <= 0) {
            if (elementData == DEFAULTCAPACITY_EMPTY_ELEMENTDATA)
                return Math.max(DEFAULT_CAPACITY, minCapacity);
            if (minCapacity < 0) // overflow
                throw new OutOfMemoryError();
            return minCapacity;
        }
 ...
    }
}
```

### 중간 삽입(add(index, data) 이나 삭제 할 때 (remove) 동작 원리

Index 없이 삽입할 때는 배열의 바로 뒤에 삽입하기 때문에 원소를 뒤로 밀 필요가 없는데, 만약에 삽입시 index 를 지정해서 삽입하는 경우나 첫번째부터 맨 뒤 바로 앞 원소를 삭제하는 경우는 배열을 밀거나 당겨줘야한다. 내부 구현체에서는  `System.arraycopy` 를 사용하여 해당 인덱스 위치만큼 앞 뒤로 복사하여 새로운 배열을 만드는 방식으로 구현하고 있다. 

```java
private void fastRemove(Object[] es, int i) {
        modCount++;
        final int newSize;
        if ((newSize = size - 1) > i)
            System.arraycopy(es, i + 1, es, i, newSize - i);
        es[size = newSize] = null;
    }
```

## 정리

**실제로는 가지고 있던 메모리 크기가 꽉 찼을 때, grow() 메서드를 사용하여  기존 사이즈의 1.5배를 늘린 새로운 배열에 기존 배열을 copy하는 것이었습니다!**  

## 느낀점

만약 ArrayList 를 사용할 때 예상되는 최대값이 10이상이라면 처음 크기를 지정할 수 있으니, 초기값으로 큰 사이즈를 넣어주면 grow() 하는 과정을 조금이나마 줄일 수 있으니 효율적일 것 같다고 생각이 되었습니다. 또한 자체적으로 System 내에서 구현한 arraycopy 를 재활용한 로직이 굉장히 감탄스러웠습니다. 이번 내용을 학습하면서 다시금 자바의 객체 지향적임, 단일책임에 대한 고민들이 느껴져서 자바의 매력에 푹 빠지게 되는 것 같네요 👍🏻

## 참고 자료

- [ArrayList javadoc](https://docs.oracle.com/en/java/javase/11/docs/api/java.base/java/util/ArrayList.html)
- 구현체 살펴봄!
- [블로그 글](https://junghyungil.tistory.com/96)