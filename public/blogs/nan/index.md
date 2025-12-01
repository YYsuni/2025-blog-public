# <center> Python 编程-入门到实践笔记
## <center> 第一章 基础知识
1. 终端运行python：
```
  win: 
1. CD 文件夹
2. 显示文件夹下文件列表: dir
3. python hello_world.py

  linux mac
1. 显示文件夹下文件列表: ls
```
## <center> 第二章 变量和简单数据类型
1. 字符串大小写处理：
``` 
title():字符串首字母大写。
upper():字符串全大写。
lower():字符串全小写。  
```
2. 字符串中使用变量：
```
f"{变量名}"
```
3. 制表符和换行符
```
\t:制表符
\n:换行符
```
4. 删除空格
```
rstrip():临时删除字符串右边空格。
lstrip():临时删除字符串左边空格。
strip():临时删除字符串两边空格。
```
5. 删除前缀
```
removeprefix(前缀)
```
6. 删除文件后缀: removesuffix(后缀)
```
练习题2.8：删除后缀
removesuffix.py

file = "word.txt"
file_1 = file.removesuffix(".txt")
print(file_1)
```
7. 浮点数：只有运算中有有浮点数，运算结果就为浮点数。
8. 可以用下划线来区分位数：1_0000_0000
9. Python之禅
```
优美优于丑陋，

明了优于隐晦；

简单优于复杂，

复杂优于繁杂，

扁平优于嵌套，

稀疏优于稠密，

可读性很重要！

特例亦不可违背原则，

即使实用比纯粹更优。

错误绝不能悄悄忽略，

除非它明确需要如此。

面对不确定性，

拒绝妄加猜测。

任何问题应有一种，

且最好只有一种，

显而易见的解决方法。

尽管这方法一开始并非如此直观，

除非你是荷兰人。

做优于不做，

然而不假思索还不如不做。

很难解释的，必然是坏方法。

很好解释的，可能是好方法。

命名空间是个绝妙的主意，

我们应好好利用它。
```
# <center> 第三章 列表简介
1. 访问列表最后一个元素：lists[-1]
2. 列表末尾添加元素：lists.append('元素')
3. 指定位置插入元素：lists.insert(0, '元素')
4. 删除指定位置元素：del lists[0]
5. 删除指定位置元素，默认末尾：lists.pop(0)
6. 删除指定值元素：remove('元素')
7. 列表按字母顺序排序：lists.sort()
8. 列表按字母反向排序：lists.sort(reverse=True)
9. 临时排序：lists.sorted()
10. 列表长度：len(lists)

# <center> 第四章 操作列表
1. range(1, 5):返回1、2、3、4 四个数。
2. range(1, 100, 2): range函数可设置步数。
3. 列表最小值:min(lists)
4. 列表最大值:max(lists)
5. 列表求和:sum(lists)
6. 列表推导式:
```
生成1到10的数，并将每个数平方，然后将平方数作为元素储存在列表中

lists = [value**2 for value in range(1, 11)]
```
7. 习题4.3：使用一个循环打印1-20（含）。
```
number_lists(1-20).py

number_lists = range(1, 21)
for number in number_lists:
    print(number)
```
8. 习题4.4：创建一个包含数 1～1000000 的列表，再使用一个 for 循环将这些数打印出来。
```commandline
number_lists(1-1000000).py

number_lists = range(1, 100_0001)
for number in number_lists:
    print(number)
```
9. 习题4.5：创建一个包含数1～1000000的列表，再使用 min() 和 max() 核实该列表确实是从
1 开始到1000000结束的。另外，对这个列表调用函数sum（）。
```commandline
number_lists_min_max_sum(1-1000000).py

number_lists = range(1, 100_0001)
number_lists_min = min(number_lists)
number_lists_max = max(number_lists)
number_lists_sum = sum(number_lists)

print(number_lists_min)
print(number_lists_max)
print(number_lists_sum)

```
10. 习题4.6：通过给range()函数指定第三个参数来创建一个列表，其中包含1～20的奇数；再使用一个
for循环将这些数打印
```commandline
number_lists_odd(1-20).py

odd_number_lists = range(1, 21, 2)
for odd_number in odd_number_lists:
    print(odd_number)
```
11. 习题4.7：创建一个列表，其中包含 3～30 内能被 3 整除的数，再使用一个 for 循环将这个列表
中的数打出来。
```commandline
multiple_3_lists.py

multiple_3_lists = range(3, 31, 3)
for multiple_3 in multiple_3_lists:
    print(multiple_3)
```
12. 习题4.8：将同一个数乘三次称为立方。例如，在 Python 中，2 的立方用 2**3 表示。创建
一个列表，其中包含前 10 个整数（1～10）的立方，再使用一个 for 循环将这些立方数打印出来。
```commandline
cube_lists(1-10).py

cube_lists = [ value**3 for value in range(1, 11)]
for cube_number in cube_lists:
    print(cube_number)
```
13. 列表切片：lists[0, 3]:返回列表0-2的元素。也可不指定开头或末尾。
14. 习题4.10：选择你在本章编写的一个程序，在末尾添加几行代码，以完成如下任务。
打印消息“The first three items in the list are:”，再使用切片来打印列表的前三个元素。
打印消息“Three items from the middle of the list are:”，再使用切片来打印列表中间的三个元素。
打印消息“The last three items in the list are:”，再使用切片来打印列表末尾的三个元素。
```commandline
slice_lists.py

lists = range(1, 11)

notice_first_three = "The first three items in the list are:"
print(notice_first_three)

for number_first_three in lists[:3]:  # 打印列表前三个元素
    print(number_first_three)

notice_middle_three = "Three items from the middle of the list are:"
print(notice_middle_three)

middle_number = int(10/2)
for number_middle_three in lists[middle_number-1:middle_number+2]: # 打印列表中间的三个元素
    print(number_middle_three)

notice_last_three = "The last three items in the list are:"
print(notice_last_three)

for number_last_three in lists[-3:]:    # 打印列表最后的三个元素
    print(number_last_three)
```
15. 元组(tuple)：不可修改元素，但可重新定义元组。tuple = (1, 2 , 3)
# <center>  第五章 if语句
1. 检查某元素是否在列表中： in和not in
2. 习题5.8：以特殊方式跟管理员打招呼　创建一个至少包含 5 个用户名的列表，并且其中一个用户名
为 'admin'。想象你要编写代码，在每个用户登录网站后都打印一条问候消息。遍历用户名列表，向每个
用户打印一条问候消息。 如果用户名为 'admin'，就打印一条特殊的问候消息，如下所示。
Hello admin, would you like to see a status report?  
否则，打印一条普通的问候消息，如下所示。  
Hello Jaden, thank you for logging in again
```commandline
greeting_users.py

users = ['nan', 'die', 'ling', 'hai', 'admin']
for user in users:
    if user == 'admin':
        print(f"Hello {user}, would you like to see a status report?")
    else:
        print(f"Hello {user}, thank you for logging in again.")
```
3. 习题5.9：处理没有用户的情形　在为练习 5.8 编写的程序中，添加一条 if 语句，检查用户名列表
是否为空。 如果为空，就打印如下消息。 We need to find some users!
删除列表中的所有用户名，确认将打印正确的消息。
```commandline
greeting_users_if_users_empty.py

users = ['nan', 'die', 'ling', 'hai', 'admin']
empty_user_notice = 'We need to find some users!'
if users:
    for user in users:
        if user == 'admin':
            print(f"Hello {user}, would you like to see a status report?")
        else:
            print(f"Hello {user}, thank you for logging in again.")
else:
    print(empty_user_notice)
```
# <center> 第六章 字典
1. 字典添加键值对，直接赋值：字典.['键']=值
2. 删除键值对：del 字典.['键']
3. 用get()方法来获取字典键值，以避免没有键值时程序报错：value = 字典.get('键', '该键不存在')
4. 习题6.1：人　使用一个字典来存储一个人的信息，包括名、姓、年龄和居住的城市。该字典应包
含键 first_name、last_name、age 和 city。将存储在该字典中的每项信息都打印出来。
```commandline
person_information.py

person_information = {'first_name': 'nan', 'last_name': 'die',
'age': '18', 'city': 'shanghai'}
print(f"{person_information['first_name']} {person_information['last_name']}'s "
      f"age is {person_information['age']}, the city of residence is "
      f"{person_information['city']}.")

```
5. 遍历字典键值对：for key, value in 字典.items():
6. 遍历字典所有键：for key in 字典.keys():
7. 按顺序遍历所有键：for key in sorted(字典.keys())
7. 遍历字典所有值：for value in 字典.values()
8. 遍历字典所有值，同时剔除重复项，使用集合：set(),：for value in set(字典.values())
# <center> 第七章 用户输入和while循环
1. 求模运算符：%，返回两数相除的余数。
2. 习题7.2:编写一个程序，询问用户有多少人用餐。如果超过 8 个人，就打印一条消息，指出没有
空桌；否则指出有空桌 
```commandline
restaurant_reservation.py

numbers_dining = input("How many people eat:")
numbers_dining = int(numbers_dining)
if numbers_dining > 8:
    print("Sorry, you don't have enough dining")
else:
    print("You have enough dining")
```
3. break: 终止循环
4. continue：忽略后续代码，返回循环开头，执行循环的下一个。
5. 习题7.5：电影票有家电影院根据观众的年龄收取不同的票价：不到3岁的观众免费；3（含）～12 岁的
观众收费10美元；年满12岁的观众收费15美元。请编写一个循环，在其中询问用户的年龄，并指出其票价。
```commandline
movie_ticket.py

ask = "\nHow old are you:"
ask += "\n(Enter 'quit' to quit.)"
active = True
while active:
    age = input(ask)
    if age == 'quit':
        active = False
    else:
        age = int(age)
        if age < 3:
            ticket_price = 0
        elif 3 <= age < 12:
            ticket_price = 10
        elif age >= 12:
            ticket_price = 15
    print(f"Your ticket price is {ticket_price} dollars.") 
```
# <center> 第8章 函数
1. 练习8.3：编写一个名为 make_shirt() 的函数，它接受一个尺码以及要印到T恤上的字样。这个函数
应该打印一个句子，简要地说明T恤的尺码和字样。先使用位置实参调用这个函数来制作一件 T 恤，再使用关
键字实参来调用这个函数。
```commandline
make_shirt.py

def make_shirt(shirt_size, shirt_logo):
    print(f"The size of this T-shirt is {shirt_size}, and the logo "
          f"is {shirt_logo}.")

make_shirt(shirt_size = 31, shirt_logo = "'Hello, world'")
```
2. return:将值返回函数调用
3. 形参可选：将形参默认指定空字符串
4. 任意数量形参：*形参，创建一个元组作为形参
5. 任意数量关键字形参：**形参，创建一个字典
# <center> 第9章 类
1. __init__():是Python中的一个特殊方法（也称为构造函数），它在创建类的新实例时自动调用，用于
初始化新对象的属性。它接收至少一个参数 self（代表实例本身），并且可以接收其他参数来为新对象设置
初始属性值
2. 练习9.1：餐馆　创建一个名为 Restaurant 的类，为其 __init__() 方法设置两个属性：
restaurant_name 和 cuisine_type。创建一个名为 describe_restaurant() 的方法和一个
名为open_restaurant()的方法，其中前者打印前述两项信息，而后者打印一条消息，指出餐馆正在营业。
```commandline
restaurant.py

class Restaurant:
    """描述餐馆信息和是否营业"""

    def __init__(self, restaurant_name, cuisine_type):
        """初始化餐馆名称和风格"""
        self.restaurant_name = restaurant_name
        self.cuisine_type = cuisine_type

    def describe_restaurant(self): # 描述餐馆信息
        print(f"The restaurant's name is {self.restaurant_name}, the The style"
              f" of this restaurant is {self.cuisine_type}.")

    def open_restaurant(self): # 显示餐馆正在营业
        print("The restaurant is open.")

chinese_restaurant = Restaurant('Sichuan Restaurant', 'Sichuan')

chinese_restaurant.describe_restaurant()
chinese_restaurant.open_restaurant()
```
3. 继承：
```commandline
class 子类(父类):
    def__init__(self, 形参） # 初始化父类属性 
    super().__init__(形参）    # 调用父类方法
```
4. 重写父类方法：可以在子类中对继承的父类方法进行重新定义。
5. 习题9.13：骰子 创建一个 Die 类，它包含一个名为 sides 的属性，该属性的默认值为6.编写一个名为
roll_die() 的方法，它打印位于1和骰子面数之间的随机数。创建一个6面的骰子并掷10次。创建一个10面
的骰子和一个20面的骰子，再分别掷10次。
```commandline
dice.py

from random import randint

class Dice:
    """掷骰子打印点数"""
    def __init__(self, sides=6):    # 骰子面数默认为6
        self.sides = sides

    def roll_dice(self):
        return randint(1, self.sides)

dice_6_points =[]
dice_6 = Dice()
for i in range(10):
    dice_6_point = dice_6.roll_dice()
    dice_6_points.append(dice_6_point)
print(dice_6_points)

dice_10_points = []
dice_10 = Dice(sides=10)
for i in range(10):
    dice_10_point = dice_10.roll_dice()
    dice_10_points.append(dice_10_point)
print(dice_10_points)

dice_20_points = []
dice_20 = Dice(sides=20)
for i in range(10):
    dice_20_point = dice_20.roll_dice()
    dice_20_points.append(dice_20_point)
print(dice_20_points)     

```
6. 习题9.14：彩票 创建一个列表或元素，其种包含10个数和5个字母。从这个列表或元组种随机选择4个数
字母，并打印一条消息，指出只要彩票上是这4个数或字母，就中大奖了。
```commandline
lottery.py

from random import choice

def win_lottery(lottery_lists):     # 从奖池号码中随机抽取4个号码并返回调用
    winners_numbers = []
    for i in range(4):
        winners_number = choice(lottery_lists)
        winners_numbers.append(winners_number)
    return winners_numbers

lottery_lists_1 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19]
winners_numbers_1 = win_lottery(lottery_lists_1 )
print(winners_numbers_1)


```
7. 习题9.15：彩票分析 可以使用一个循环来理解中前述彩票中奖有多难。为此，创建一个名为my_ticket的
列表或元组，再编写一个循环，不断地随机选择数字或字母，直到中大奖为止。请打印一条消息，报告执行多少次
循环才中了大奖。
```commandline
lottery_tries.py

from random import choice

def win_lottery(lottery_lists): # 从奖池号码中随机抽取4个号码并返回调用
    winners_numbers = []
    for i in range(4):
        winners_number = choice(lottery_lists)
        winners_numbers.append(winners_number)
    return winners_numbers

def tries_numbers():    # 从奖池号码中循环随机抽取4个号码，直到和中奖号码相同，返回循环次数
    lottery_lists = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
    my_ticket = [1, 3, 5, 7]
    tries_number = 0
    active = True
    while active:
        new_winning_ticket = win_lottery(lottery_lists)
        tries_number = tries_number + 1
        if new_winning_ticket == my_ticket:
            active = False
    return tries_number

tries_number_1 = tries_numbers()
print(tries_number_1)

```
## <center> 第10章 文件和异常
1. pathlib模块：处理文件和目录
2. splitlines():将文件的每一行作为元素，生成列表。
3. read_text():读取文件
4. write_text():写入文件
5. 习题10.4：访客 编写一个程序，提示用户输入其名字。在用户做出响应后，将其名字写入文件guest.txt
```commandline
guest.py
from pathlib import Path

username = input("Enter username:")
path = Path('guest.txt')
path.write_text(username)

```
6. 习题10.5：访客簿 编写一个while循环，提示用户输入其名字。收集用户输入的所有名字，将其
写入guest_book.txt，并确保这个文件中的每天记录都独占一行。
```commandline
guest.py

from pathlib import Path

path = Path('guest.txt')
usernames = []
username_str = ''
active = True
while active:
    username = input("Enter username(Enter 'q' to quit)):\n")
    if username == 'q':
        active = False
    else:
        usernames.append(username)

for name in usernames:
    username_str = username_str + f"{name}\n"
path.write_text(username_str)
```
7. 习题 10.6：加法运算 在提示用户提供数值输入时，常出现的一个问题是，用户提供的是文本而不是数。
在这种情况下，当你尝试将输入转换为整数时，将引发 ValueError 异常。编写一个程序，提示用户输入
两个数，再将它们相加并打印结果。在用户输入的任意一个值不是数时都捕获 ValueError 异常，并打印
一条友好的错误消息。对你编写的程序进行测试：先输入两个数，再输入一些文本而不是数。
```
addition_operation.py

try:
    number_1 = int(input("输入一个数字:\n"))
    number_2 = int(input("输入另一个数字:\n"))
    number_add = number_1 + number_2
except ValueError:
    print("输入的不是数字")
else:
    print(f"{number_1}与{number_2}相加的和为{number_add}")

```
8. 习题10.7：加法计算器 将为练习10.6编写的代码放在一个 while 循环中，让用户在犯错
（输入的时是文本而不是数）后能够继续输入数。
```commandline
addtion_operation_1.py

while True:
    try:
        number_1 = input("输入一个数字:\n")
        if number_1 == 'q':
            break
        number_1 = int(number_1)
        number_2 = input("输入另一个数字:\n")
        if number_2 == 'q':
            break
        number_2 = int(number_2)
        number_add = number_1 + number_2
    except ValueError:
        print("输入的不是数字,请重新输入：")
    else:
        print(f"{number_1}与{number_2}相加的和为{number_add}")
```
9. 习题10.8：猫和狗 创建文件 cats.txt 和 dogs.txt，在第一个文件中至少存储三只猫的名字，在
第二个文件中至少存储三条狗的名字。编写一个程序，尝试读取这些文件，并将其内容打印在屏幕上。将这些
代码放在一个try-except代码块中，以便在文件不存在时捕获FileNotFoundError异常，并显示一条友好
的消息。将任意一个文件移到另一个地方，并确认except代码块中的代码将正确地执行。
```commandline
cat_and_dog.py

from pathlib import Path

def file_export(file_path):
    """读取文件文件并输出内容"""
    try:
        contents = Path(file_path).read_text(encoding="utf-8")
    except FileNotFoundError:
        print("该文件不存在")
    else:
        print(f"The file {file_path} has name:\n")
        words = contents.split()
        for word in words:
            print(f"{word}\n")

filenames = ['cats.txt', 'dogs.txt']
for filename in filenames:
    file_export(filename)

```
10. 习题10.9：静默的猫和狗 修改你在练习10.8 中编写的except代码块，让程序在文件
不存在时静默失败
```commandline
from pathlib import Path

def file_export(file_path):
    """读取文件文件并输出内容"""
    try:
        contents = Path(file_path).read_text(encoding="utf-8")
    except FileNotFoundError:
        pass
    else:
        print(f"The file {file_path} has name:\n")
        words = contents.split()
        for word in words:
            print(f"{word}\n")

filenames = ['cats.txt', 'dogs.txt']
for filename in filenames:
    file_export(filename)

```
11. json.dumps():以json格式存储数据
12. json.loads():读取json文件
13. 习题10.11 喜欢的数 编写一个程序，提示用户输入自己喜欢的数，并使用json.dumps() 将这个数
存储在文件中。再编写一个程序，从文件中读取这个数，并打印如下消息。I know your favorite 
number! It's____.
```
from pathlib import Path
import json

def get_favorite_number():
    path = Path('favorite_number.json')

    if path.exists():
        contents = path.read_text()
    else:
        number = input("What is your favorite number? ")
        contents = json.dumps(number)
        path.write_text(contents)

    favorite_number = json.loads(contents)
    print(f"I know your favorite number! It's {favorite_number}")

get_favorite_number()
```
14. 用户字典 示例 remember_me.py 只存储了一项信息——用户名。请扩展该示例