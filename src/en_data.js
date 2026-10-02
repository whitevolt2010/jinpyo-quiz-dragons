const WORDS = `
cat|🐱|고양이|1
dog|🐶|강아지|1
pig|🐷|돼지|1
cow|🐮|소|1
hen|🐔|암탉|1
duck|🦆|오리|1
bird|🐦|새|1
fish|🐟|물고기|1
frog|🐸|개구리|1
bear|🐻|곰|1
lion|🦁|사자|1
tiger|🐯|호랑이|1
rabbit|🐰|토끼|1
monkey|🐵|원숭이|1
elephant|🐘|코끼리|1
mouse|🐭|생쥐|1
sheep|🐑|양|1
horse|🐴|말|1
bee|🐝|벌|1
ant|🐜|개미|1
apple|🍎|사과|1
banana|🍌|바나나|1
milk|🥛|우유|1
egg|🥚|달걀|1
bread|🍞|빵|1
cake|🍰|케이크|1
water|💧|물|1
rice|🍚|밥|1
candy|🍬|사탕|1
cookie|🍪|쿠키|1
pizza|🍕|피자|1
ball|⚽|공|1
book|📖|책|1
pen|🖊️|펜|1
bed|🛏️|침대|1
box|📦|상자|1
cup|🥤|컵|1
bag|🎒|가방|1
hat|🎩|모자|1
car|🚗|자동차|1
bus|🚌|버스|1
bike|🚲|자전거|1
key|🔑|열쇠|1
doll|🪆|인형|1
drum|🥁|북|1
star|⭐|별|1
sun|☀️|해|1
moon|🌙|달|1
tree|🌳|나무|1
flower|🌸|꽃|1
rain|🌧️|비|1
snow|❄️|함박눈|1
cloud|☁️|구름|1
fire|🔥|불|1
leaf|🍃|나뭇잎|1
hand|✋|손|1
eye|👁️|눈|1
nose|👃|코|1
ear|👂|귀|1
mouth|👄|입|1
foot|🦶|발|1
leg|🦵|다리|1
mom|👩|엄마|1
dad|👨|아빠|1
baby|👶|아기|1
boy|👦|남자아이|1
girl|👧|여자아이|1
red|🔴|빨강|1
blue|🔵|파랑|1
green|🟢|초록|1
yellow|🟡|노랑|1
black|⚫|검정|1
white|⚪|하양|1
pink|💗|분홍|1
brown|🟤|갈색|1
one|1️⃣|하나|1
two|2️⃣|둘|1
three|3️⃣|셋|1
four|4️⃣|넷|1
five|5️⃣|다섯|1
six|6️⃣|여섯|1
seven|7️⃣|일곱|1
eight|8️⃣|여덟|1
nine|9️⃣|아홉|1
ten|🔟|열|1
house|🏠|집|1
door|🚪|문|1
window|🪟|창문|1
chair|💺|의자|1
table|🪑|식탁|1
school|🏫|학교|2
desk||책상|2
pencil|✏️|연필|2
eraser|🧽|지우개|2
ruler|📏|자|2
notebook|📓|공책|2
crayon|🖍️|크레용|2
scissors|✂️|가위|2
classroom||교실|2
teacher|👩‍🏫|선생님|2
friend|🧑‍🤝‍🧑|친구|2
student|🧑‍🎓|학생|2
orange|🍊|오렌지|2
grape|🍇|포도|2
melon|🍈|멜론|2
strawberry|🍓|딸기|2
peach|🍑|복숭아|2
carrot|🥕|당근|2
potato|🥔|감자|2
tomato|🍅|토마토|2
corn|🌽|옥수수|2
onion|🧅|양파|2
juice|🧃|주스|2
soup|🥣|국|2
meat|🍖|고기|2
chicken|🍗|닭고기|2
noodle|🍜|국수|2
salad|🥗|샐러드|2
spoon|🥄|숟가락|2
fork|🍴|포크|2
plate|🍽️|접시|2
park|🏞️|공원|2
zoo|🦓|동물원|2
shop|🏪|가게|2
hospital|🏥|병원|2
farm|🚜|농장|2
beach|🏖️|해변|2
mountain|⛰️|산|2
river|🏞️|강|2
sea|🌊|바다|2
sky|🌌|하늘|2
road|🛣️|길|2
bridge|🌉|다리(강 위)|2
train|🚂|기차|2
plane|✈️|비행기|2
boat|⛵|배|2
ship|🚢|큰 배|2
truck|🚚|트럭|2
taxi|🚕|택시|2
subway|🚇|지하철|2
big|🐘|큰|2
small|🐜|작은|2
long|📏|긴|2
short||짧은|2
hot|🔥|뜨거운|2
cold|🧊|차가운|2
new|🆕|새로운|2
old|👴|낡은|2
fast|🏎️|빠른|2
slow|🐢|느린|2
tall||키 큰|2
happy|😀|행복한|2
sad|😢|슬픈|2
angry|😡|화난|2
hungry|😋|배고픈|2
sleepy|😴|졸린|2
thirsty|🥤|목마른|2
clean|🧼|깨끗한|2
dirty||더러운|2
go|➡️|가다|2
come|⬅️|오다|2
eat|🍽️|먹다|2
drink|🥤|마시다|2
run|🏃|달리다|2
jump|🤸|뛰다|2
walk|🚶|걷다|2
sit|🪑|앉다|2
stand||서다|2
sleep|😴|자다|2
play|🎮|놀다|2
sing|🎤|노래하다|2
look|👀|보다|2
listen|👂|듣다|2
open||열다|2
close||닫다|2
Monday||월요일|3
Tuesday||화요일|3
Wednesday||수요일|3
Thursday||목요일|3
Friday||금요일|3
Saturday||토요일|3
Sunday||일요일|3
January||1월|3
March||3월|3
May||5월|3
July||7월|3
September||9월|3
December||12월|3
family|👪|가족|3
grandmother|👵|할머니|3
grandfather|👴|할아버지|3
sister|👧|여자 형제|3
brother|👦|남자 형제|3
parents|👫|부모님|3
uncle||삼촌|3
aunt||이모·고모|3
math|➗|수학|3
science|🔬|과학|3
music|🎵|음악|3
art|🎨|미술|3
English||영어|3
Korean||국어|3
history|📜|역사|3
morning|🌅|아침|3
afternoon|🌤️|오후|3
evening|🌆|저녁|3
night|🌙|밤|3
today||오늘|3
tomorrow||내일|3
yesterday||어제|3
week||주|3
month||달(한 달)|3
year||해·년|3
hour||시간|3
minute||분|3
homework|📝|숙제|3
lesson||수업|3
lunch|🍱|점심|3
breakfast|🥣|아침밥|3
dinner|🍽️|저녁밥|3
test|📝|시험|3
spring|🌱|봄|3
summer|🏖️|여름|3
fall|🍂|가을|3
winter|⛄|겨울|3
doctor|👩‍⚕️|의사|3
nurse|👨‍⚕️|간호사|3
cook|👨‍🍳|요리사|3
farmer|👨‍🌾|농부|3
singer|🎤|가수|3
driver|🚕|운전사|3
pilot|✈️|조종사|3
study|📚|공부하다|3
read|📖|읽다|3
write|✍️|쓰다|3
draw|🖍️|그리다|3
dance|💃|춤추다|3
swim|🏊|수영하다|3
count|🔢|세다|3
wash|🧼|씻다|3
help|🤝|돕다|3
like|❤️|좋아하다|3
want||원하다|3
have||가지다|3
make|🔨|만들다|3
take||가져가다|3
give|🎁|주다|3
find|🔍|찾다|3
hello|👋|안녕|3
goodbye||잘 가|3
please||부탁해요|3
sorry||미안해|3
thanks||고마워|3
birthday|🎂|생일|3
party|🎉|파티|3
present|🎁|선물|3
picnic|🧺|소풍|3
number|🔢|숫자|3
name||이름|3
age||나이|3
weather|🌦️|날씨|4
sunny|☀️|화창한|4
cloudy|☁️|흐린|4
rainy|🌧️|비 오는|4
snowy|🌨️|눈 오는|4
windy|🌬️|바람 부는|4
warm|🌡️|따뜻한|4
cool|🧊|시원한|4
clothes|👕|옷|4
shirt|👕|셔츠|4
pants|👖|바지|4
skirt|👗|치마|4
dress|👗|원피스|4
coat|🧥|외투|4
shoes|👟|신발|4
socks|🧦|양말|4
cap|🧢|야구모자|4
gloves|🧤|장갑|4
scarf|🧣|목도리|4
uniform||교복|4
library|📚|도서관|4
museum|🏛️|박물관|4
bank|🏦|은행|4
market|🏪|시장|4
restaurant|🍽️|식당|4
station|🚉|역|4
airport|🛫|공항|4
bakery|🥐|빵집|4
bookstore|📗|서점|4
theater|🎭|극장|4
hotel|🏨|호텔|4
left|⬅️|왼쪽|4
right|➡️|오른쪽|4
straight||곧장|4
front||앞|4
back||뒤|4
near||가까운|4
far||먼|4
corner||모퉁이|4
between||사이에|4
behind||뒤에|4
under||아래에|4
over||위에|4
inside||안에|4
outside||밖에|4
excited|🤩|신난|4
bored|🥱|지루한|4
tired|😩|피곤한|4
nervous|😰|긴장한|4
proud|😌|자랑스러운|4
surprised|😲|놀란|4
scared|😱|무서운|4
lonely||외로운|4
kind||친절한|4
brave||용감한|4
funny|😂|웃긴|4
smart|🤓|똑똑한|4
quiet|🤫|조용한|4
busy||바쁜|4
careful||조심스러운|4
delicious|😋|맛있는|4
beautiful||아름다운|4
expensive|💰|비싼|4
cheap||싼|4
easy||쉬운|4
difficult||어려운|4
important||중요한|4
dangerous|⚠️|위험한|4
famous|🌟|유명한|4
money|💰|돈|4
price||가격|4
dollar|💵|달러|4
ticket|🎫|표|4
buy|🛒|사다|4
sell||팔다|4
letter|✉️|편지|4
phone|📱|전화|4
message|💬|메시지|4
picture|🖼️|그림|4
computer|💻|컴퓨터|4
kitchen|🍳|부엌|4
bathroom|🛁|욕실|4
garden|🌷|정원|4
floor||층·바닥|4
wall||벽|4
hobby|🎯|취미|5
soccer|⚽|축구|5
baseball|⚾|야구|5
basketball|🏀|농구|5
tennis|🎾|테니스|5
badminton|🏸|배드민턴|5
swimming|🏊|수영|5
skating|⛸️|스케이트|5
hiking|🥾|등산|5
fishing|🎣|낚시|5
camping|🏕️|캠핑|5
cooking|🍳|요리|5
game|🎮|게임|5
movie|🎬|영화|5
concert|🎫|음악회|5
contest|🏆|대회|5
club||동아리|5
travel|🧳|여행하다|5
trip|🚗|여행|5
vacation|✈️|방학|5
holiday|🎊|휴일|5
map|🗺️|지도|5
photo|📷|사진|5
camera|📷|사진기|5
guide||안내자|5
health|💪|건강|5
medicine|💊|약|5
cough|😷|기침|5
fever|🤒|열(체온)|5
headache|🤕|두통|5
hurt||아프다|5
rest|🛌|쉬다|5
exercise|🏋️|운동하다|5
become||~이 되다|5
choose||고르다|5
decide||결정하다|5
enjoy||즐기다|5
explain||설명하다|5
invite||초대하다|5
join||함께하다|5
prepare||준비하다|5
protect||보호하다|5
remember||기억하다|5
forget||잊다|5
save||아끼다|5
share||나누다|5
solve||해결하다|5
teach||가르치다|5
understand||이해하다|5
worry||걱정하다|5
practice||연습하다|5
visit||방문하다|5
believe||믿다|5
change||바꾸다|5
follow||따르다|5
grow||자라다|5
hope||바라다|5
future||미래|5
dream|💭|꿈|5
plan||계획|5
goal|🎯|목표|5
job||직업|5
idea|💡|생각|5
reason||이유|5
result||결과|5
problem||문제|5
answer||답|5
question|❓|질문|5
opinion||의견|5
advice||충고|5
news|📰|소식|5
story|📚|이야기|5
example||예|5
better||더 좋은|5
best|🥇|가장 좋은|5
more||더 많은|5
most||가장 많은|5
than||~보다|5
same||같은|5
different||다른|5
always||항상|5
usually||보통|5
often||자주|5
sometimes||가끔|5
never||전혀 안|5
environment|🌍|환경|6
pollution|🏭|오염|6
energy|⚡|에너지|6
climate|🌡️|기후|6
nature|🌿|자연|6
planet|🪐|행성|6
recycle|♻️|재활용하다|6
reduce||줄이다|6
waste|🗑️|쓰레기|6
plastic||플라스틱|6
forest|🌲|숲|6
ocean|🌊|대양|6
society||사회|6
community||지역 사회|6
culture||문화|6
tradition||전통|6
festival|🎆|축제|6
country|🗺️|나라|6
world|🌍|세계|6
language||언어|6
volunteer|🙋|자원봉사|6
charity||자선|6
rule||규칙|6
peace|🕊️|평화|6
technology||기술|6
internet|🌐|인터넷|6
robot|🤖|로봇|6
program||프로그램|6
machine||기계|6
invention|💡|발명품|6
experiment|🔬|실험|6
research||연구|6
discovery||발견|6
career||진로|6
interview||면접|6
presentation||발표|6
report||보고서|6
project||과제|6
speech||연설|6
grade||성적|6
subject||과목|6
university|🎓|대학|6
challenge||도전|6
courage||용기|6
success|🏆|성공|6
failure||실패|6
effort||노력|6
respect||존중하다|6
responsibility||책임|6
experience||경험|6
chance||기회|6
choice||선택|6
difference||차이|6
memory||기억|6
agree||동의하다|6
disagree||반대하다|6
compare||비교하다|6
imagine||상상하다|6
improve||나아지게 하다|6
introduce||소개하다|6
realize||깨닫다|6
suggest||제안하다|6
went||갔다|6
ate||먹었다|6
saw||보았다|6
made||만들었다|6
took||탔다·가져갔다|6
bought||샀다|6
wrote||썼다|6
met||만났다|6
won||이겼다|6
found||찾았다|6
told||말했다|6
brought||가져왔다|6
gave||주었다|6
came||왔다|6
knew||알았다|6
thought||생각했다|6
began||시작했다|6
because||왜냐하면|6
although||비록 ~이지만|6
however||그러나|6
also||또한|6
finally||마침내|6
`.trim().split('\n').map(l => { const f = l.split('|'); return { w: f[0], e: f[1], k: f[2], g: +f[3] }; });
const SENTS = `
I like apples.|나는 사과를 좋아해요.|like|v|1
This is a cat.|이것은 고양이예요.|is|be|1
I have a ball.|나는 공이 있어요.|have|v|1
It is red.|그것은 빨간색이에요.|red|col|1
I am happy.|나는 행복해요.|happy|adj1|1
Look at the dog!|강아지를 봐!|dog|n1|1
I see a bird.|나는 새를 봐요.|see|v|1
My mom is kind.|우리 엄마는 친절해요.|mom|n1|1
I can run.|나는 달릴 수 있어요.|run|v|1
Good morning!|좋은 아침!|morning|time|1
How are you?|잘 지내니?|are|be|1
I am fine.|나는 잘 지내요.|fine|adj1|1
Let's play together.|같이 놀자.|play|v|1
Sit down, please.|앉으세요.|down|adv|1
It is a big dog.|그건 큰 강아지야.|big|adj1|1
I love my dad.|나는 아빠를 사랑해요.|love|v|1
The sun is hot.|해는 뜨거워요.|hot|adj1|1
I have two eyes.|나는 눈이 두 개 있어요.|two|num|1
Open the door.|문을 열어요.|Open|vimp|1
Come here!|이리 와!|Come|vimp|1
I want water.|나는 물을 원해요.|want|v|1
The cat is small.|고양이는 작아요.|small|adj1|1
My bag is blue.|내 가방은 파란색이에요.|blue|col|1
Happy birthday!|생일 축하해!|Happy|adj1|1
Thank you very much.|정말 고마워요.|Thank|vimp|1
I go to school.|나는 학교에 가요.|school|n2|2
She is my sister.|그 애는 내 여동생이에요.|is|be|2
The cat is on the table.|고양이가 탁자 위에 있어요.|on|prep|2
I do not like carrots.|나는 당근을 안 좋아해요.|not|aux|2
What is this?|이게 뭐야?|What|wh|2
It is a pencil.|그건 연필이야.|pencil|n2|2
I have three books.|나는 책이 세 권 있어요.|three|num|2
He is very tall.|그는 키가 아주 커요.|tall|adj2|2
I want some juice.|주스를 좀 주세요.|want|v|2
Where is my bag?|내 가방 어디 있어?|Where|wh|2
It is under the chair.|의자 아래에 있어.|under|prep|2
I like summer best.|나는 여름을 가장 좋아해요.|summer|n3|2
Can you swim?|수영할 수 있니?|Can|aux|2
Yes, I can.|응, 할 수 있어.|can|aux|2
It is rainy today.|오늘은 비가 와요.|rainy|adj3|2
The bus is fast.|버스는 빨라요.|fast|adj2|2
Let's eat lunch.|점심 먹자.|eat|v|2
I am thirsty.|나는 목말라요.|thirsty|adj2|2
Please close the window.|창문을 닫아 주세요.|close|vimp|2
The sea is beautiful.|바다가 아름다워요.|sea|n2|2
My school is near.|우리 학교는 가까워요.|near|adj2|2
I ride my bike.|나는 자전거를 타요.|ride|v|2
Look at the sky.|하늘을 봐.|sky|n2|2
The soup is hot.|국이 뜨거워요.|hot|adj1|2
I clean my room.|나는 내 방을 청소해요.|clean|v|2
What day is it today?|오늘 무슨 요일이야?|day|n3|3
It is Monday.|월요일이야.|Monday|day|3
I get up at seven.|나는 일곱 시에 일어나요.|at|prep|3
My favorite subject is math.|내가 좋아하는 과목은 수학이야.|math|n3|3
I study English every day.|나는 매일 영어를 공부해요.|study|v|3
How many books do you have?|책이 몇 권 있니?|many|wh2|3
She likes music.|그 애는 음악을 좋아해요.|likes|v3|3
Let's go to the park.|공원에 가자.|park|n3|3
What time is it?|몇 시야?|time|n3|3
I am sorry. I am late.|미안해. 늦었어.|late|adj2|3
My birthday is in May.|내 생일은 5월이야.|in|prep|3
Do you want some juice?|주스 좀 마실래?|Do|aux|3
He cannot come today.|그는 오늘 못 와.|cannot|aux|3
I usually play soccer.|나는 보통 축구를 해요.|usually|freq|3
Please help me.|도와주세요.|help|vimp|3
I have a test tomorrow.|나는 내일 시험이 있어요.|tomorrow|n3|3
My father is a doctor.|우리 아빠는 의사예요.|doctor|job|3
We have lunch at noon.|우리는 정오에 점심을 먹어요.|lunch|n3|3
How old are you?|몇 살이니?|old|adj2|3
I am nine years old.|나는 아홉 살이야.|years|n3|3
Winter is very cold.|겨울은 아주 추워요.|cold|adj1|3
She can draw well.|그 애는 그림을 잘 그려요.|draw|v|3
Let's make a cake.|케이크를 만들자.|make|v|3
I do my homework.|나는 숙제를 해요.|homework|n3|3
This is my friend.|이 애는 내 친구야.|friend|n2|3
Nice to meet you.|만나서 반가워.|meet|v|3
I want to be a pilot.|나는 조종사가 되고 싶어요.|pilot|job|3
We go on a picnic.|우리는 소풍을 가요.|picnic|n3|3
Where is the library?|도서관이 어디예요?|library|n4|4
It is next to the bank.|은행 옆에 있어요.|next|prep|4
Go straight and turn left.|곧장 가서 왼쪽으로 도세요.|straight|adv|4
How was your weekend?|주말 어땠어?|was|be|4
It was great!|아주 좋았어!|great|adj2|4
I want to be a teacher.|나는 선생님이 되고 싶어요.|teacher|job|4
What are you doing?|뭐 하고 있어?|doing|ing|4
I am reading a book.|나는 책을 읽고 있어.|reading|ing|4
Whose bag is this?|이건 누구 가방이야?|Whose|wh|4
The weather is sunny.|날씨가 화창해요.|sunny|adj3|4
Do not run in the hallway.|복도에서 뛰지 마세요.|not|aux|4
I am taller than you.|내가 너보다 키가 커.|than|prep|4
Let's meet at three.|세 시에 만나자.|meet|v|4
How much is this cap?|이 모자 얼마예요?|much|wh2|4
She is wearing a red skirt.|그 애는 빨간 치마를 입고 있어.|wearing|ing|4
It is cold outside.|밖은 추워요.|outside|prep|4
I need new shoes.|나는 새 신발이 필요해요.|need|v|4
The museum opens at ten.|박물관은 열 시에 열어요.|opens|v3|4
Please be quiet.|조용히 해 주세요.|quiet|adj4|4
This food is delicious.|이 음식은 맛있어요.|delicious|adj4|4
I feel tired today.|나는 오늘 피곤해요.|tired|adj4|4
Can I use your phone?|네 전화 좀 써도 될까?|Can|aux|4
The ticket is expensive.|표가 비싸요.|expensive|adj4|4
Let's take a picture.|사진 찍자.|take|v|4
He is very brave.|그는 아주 용감해요.|brave|adj4|4
I put on my coat.|나는 외투를 입어요.|coat|n4|4
The bakery is over there.|빵집은 저기 있어요.|over|prep|4
We are going to the beach.|우리는 해변에 가는 중이야.|going|ing|4
What do you want to do?|무엇을 하고 싶니?|want|v|5
I want to travel the world.|나는 세계를 여행하고 싶어.|travel|v2|5
I am going to visit my grandma.|나는 할머니를 방문할 거예요.|visit|v2|5
She went to the museum.|그 애는 박물관에 갔어요.|went|past|5
I did not go to school yesterday.|나는 어제 학교에 안 갔어요.|not|aux|5
Why are you late?|왜 늦었어?|Why|wh|5
Because I missed the bus.|버스를 놓쳤기 때문이야.|Because|conj|5
You should drink more water.|물을 더 마시는 게 좋겠어.|should|aux|5
May I use your pen?|네 펜을 써도 될까?|May|aux|5
I enjoyed the concert.|나는 그 음악회를 즐겼어요.|enjoyed|past|5
He is good at soccer.|그는 축구를 잘해요.|at|prep|5
What is wrong?|무슨 일이야?|wrong|adj4|5
I have a headache.|머리가 아파요.|headache|n5|5
Let's take a rest.|좀 쉬자.|rest|v|5
This book is more interesting.|이 책이 더 재미있어.|more|comp|5
My hobby is fishing.|내 취미는 낚시예요.|hobby|n5|5
I practice the piano every day.|나는 매일 피아노를 연습해요.|practice|v2|5
We should protect animals.|우리는 동물을 보호해야 해요.|protect|v2|5
I hope to see you again.|다시 만나기를 바라요.|hope|v2|5
She always helps her friends.|그 애는 항상 친구를 도와요.|always|freq|5
Don't worry about it.|그것에 대해 걱정하지 마.|worry|v2|5
I decided to join the club.|나는 동아리에 들기로 했어요.|decided|past|5
Can you explain it again?|다시 설명해 줄래?|explain|v2|5
The trip was exciting.|그 여행은 신났어요.|exciting|adj4|5
I usually get up early.|나는 보통 일찍 일어나요.|usually|freq|5
What is your plan for today?|오늘 계획이 뭐야?|plan|n5|5
Please remember my name.|내 이름을 기억해 줘.|remember|v2|5
I want to become a scientist.|나는 과학자가 되고 싶어요.|become|v2|5
I went camping last weekend.|나는 지난 주말에 캠핑을 갔어요.|went|past|6
What are you going to do this summer?|이번 여름에 뭐 할 거야?|going|ing|6
I am planning to learn Chinese.|나는 중국어를 배울 계획이야.|planning|ing|6
If it rains, we will stay home.|비가 오면 우리는 집에 있을 거야.|will|aux|6
She is the tallest in our class.|그 애는 우리 반에서 키가 가장 커요.|tallest|comp|6
I think we should save energy.|우리는 에너지를 아껴야 한다고 생각해.|should|aux|6
Recycling helps the environment.|재활용은 환경을 도와요.|environment|n6|6
Could you tell me the way?|길을 알려 주시겠어요?|Could|aux|6
I have been to Jeju Island.|나는 제주도에 가 본 적이 있어요.|been|past|6
He has lived here for five years.|그는 여기서 5년째 살고 있어요.|for|prep|6
Although it was hard, I finished it.|힘들었지만 나는 끝냈어요.|Although|conj|6
What do you think about it?|그것에 대해 어떻게 생각해?|about|prep|6
I agree with you.|나는 네 말에 동의해.|agree|v2|6
The movie was boring.|그 영화는 지루했어요.|boring|adj4|6
I would like to order pizza.|피자를 주문하고 싶어요.|order|v2|6
We must reduce plastic waste.|우리는 플라스틱 쓰레기를 줄여야 해요.|reduce|v2|6
She bought a new computer.|그 애는 새 컴퓨터를 샀어요.|bought|past|6
This is the best book I ever read.|이건 내가 읽은 최고의 책이야.|best|comp|6
Pollution is a serious problem.|오염은 심각한 문제예요.|Pollution|n6|6
I was surprised at the news.|나는 그 소식에 놀랐어요.|surprised|adj4|6
Many people volunteer in our town.|많은 사람들이 우리 마을에서 자원봉사해요.|volunteer|v2|6
He told me an interesting story.|그는 나에게 재미있는 이야기를 해 줬어요.|told|past|6
Let me introduce my family.|우리 가족을 소개할게요.|introduce|v2|6
Technology changes our life.|기술은 우리 삶을 바꿔요.|Technology|n6|6
I made a presentation yesterday.|나는 어제 발표를 했어요.|made|past|6
Success comes from effort.|성공은 노력에서 옵니다.|effort|n6|6
However, I did not give up.|그러나 나는 포기하지 않았어요.|However|conj|6
We respect different cultures.|우리는 다른 문화를 존중해요.|respect|v2|6
`.trim().split('\n').map(l => { const f = l.split('|'); return { en: f[0], ko: f[1], b: f[2], p: f[3], g: +f[4] }; });
const TALKS = `
How are you?|I am fine.|잘 지내니? — 잘 지내.|1
What is your name?|I am Jinpyo.|이름이 뭐니? — 나는 진표야.|1
How old are you?|I am eight.|몇 살이니? — 여덟 살이야.|1
Nice to meet you.|Me, too.|만나서 반가워. — 나도.|1
Thank you!|You are welcome.|고마워! — 천만에.|1
Good night!|Sleep well.|잘 자! — 잘 자렴.|1
Are you hungry?|Yes, I am.|배고프니? — 응, 배고파.|1
Let's play!|Sounds good!|같이 놀자! — 좋아!|2
What color is it?|It is blue.|무슨 색이야? — 파란색이야.|2
Do you like pizza?|Yes, I do.|피자 좋아하니? — 응, 좋아해.|2
Where is the cat?|Under the bed.|고양이 어디 있어? — 침대 아래에.|2
Can you help me?|Sure!|도와줄래? — 그럼!|2
Is this your bag?|No, it is not.|이거 네 가방이야? — 아니야.|2
How is the weather?|It is sunny.|날씨 어때? — 화창해.|2
What day is it?|It is Friday.|무슨 요일이야? — 금요일이야.|3
What time is it?|It is three.|몇 시야? — 세 시야.|3
What is this?|It is a ruler.|이게 뭐야? — 자야.|3
Where do you live?|In Seoul.|어디 사니? — 서울에.|3
What do you do?|I am a student.|무슨 일 하세요? — 학생이에요.|3
Do you have a pen?|Yes, here you are.|펜 있니? — 응, 여기 있어.|3
How many pencils?|I have five.|연필이 몇 개야? — 다섯 개 있어.|3
What is your favorite subject?|I like art.|좋아하는 과목이 뭐야? — 미술을 좋아해.|3
Where is the bank?|Next to the park.|은행이 어디예요? — 공원 옆이에요.|4
How was your trip?|It was great.|여행 어땠어? — 아주 좋았어.|4
Can I help you?|Yes, please.|도와드릴까요? — 네, 부탁해요.|4
How much is it?|Ten dollars.|얼마예요? — 십 달러예요.|4
What are you doing?|I am cooking.|뭐 하고 있어? — 요리하고 있어.|4
Whose book is this?|It is mine.|이건 누구 책이야? — 내 거야.|4
How do I get there?|Go straight.|거기 어떻게 가요? — 곧장 가세요.|4
Would you like some tea?|Yes, thank you.|차 드실래요? — 네, 고마워요.|4
What do you want to be?|A pilot.|뭐가 되고 싶니? — 비행기 조종사.|5
Why are you happy?|Because I won.|왜 기분이 좋아? — 내가 이겼거든.|5
What is wrong?|I have a cough.|무슨 일이야? — 기침이 나.|5
May I take a picture?|Sure, go ahead.|사진 찍어도 될까요? — 그럼요.|5
How often do you read?|Twice a week.|얼마나 자주 읽니? — 일주일에 두 번.|5
What is your hobby?|I enjoy hiking.|취미가 뭐야? — 등산을 즐겨.|5
Shall we go now?|Let's wait a bit.|이제 갈까? — 조금만 기다리자.|5
Do you need help?|No, I am okay.|도움이 필요해? — 아니, 괜찮아.|5
What did you do?|I went camping.|뭐 했어? — 캠핑 갔어.|6
Do you agree?|Yes, I do.|동의하니? — 응, 동의해.|6
How long have you studied?|For three years.|얼마나 공부했니? — 삼 년 동안.|6
Could you tell me the way?|Go straight two blocks.|길을 알려 주실래요? — 두 블록 곧장 가세요.|6
What are you going to do?|I will join a club.|뭐 할 거야? — 동아리에 들 거야.|6
Why do you think so?|Because it is true.|왜 그렇게 생각해? — 사실이니까.|6
What is your opinion?|I think it is important.|네 의견은 뭐야? — 중요하다고 생각해.|6
Have you ever been there?|Yes, once.|거기 가 본 적 있어? — 응, 한 번.|6
`.trim().split('\n').map(l => { const f = l.split('|'); return { q: f[0], a: f[1], ko: f[2], g: +f[3] }; });


/* ================= 빈칸 보기 꾸러미 ================= */
const POOL = {
  v: ['like', 'have', 'want', 'see', 'go', 'eat', 'play', 'read', 'help', 'run', 'study', 'take', 'meet', 'make', 'love', 'ride', 'clean', 'need', 'rest'],
  v2: ['travel', 'visit', 'agree', 'order', 'join', 'learn', 'practice', 'protect', 'hope', 'worry', 'explain', 'remember', 'become', 'reduce', 'introduce', 'respect', 'volunteer'],
  v3: ['likes', 'plays', 'reads', 'goes', 'wants', 'helps', 'opens', 'lives'],
  vimp: ['Open', 'Close', 'Come', 'Look', 'Sit', 'Stand', 'Thank', 'Help', 'Please', 'Listen'],
  past: ['went', 'ate', 'saw', 'made', 'took', 'bought', 'enjoyed', 'been', 'found', 'met', 'told', 'decided', 'gave', 'came'],
  ing: ['doing', 'reading', 'going', 'planning', 'wearing', 'cooking', 'playing', 'writing', 'making'],
  be: ['is', 'am', 'are', 'was', 'were'],
  aux: ['can', 'cannot', 'will', 'should', 'may', 'must', 'do', 'not', 'did', 'could', 'would'],
  wh: ['What', 'Where', 'When', 'Who', 'Why', 'How', 'Which', 'Whose'],
  wh2: ['many', 'much', 'often', 'long', 'far'],
  prep: ['in', 'on', 'at', 'to', 'for', 'with', 'under', 'next', 'about', 'than', 'from', 'over', 'outside', 'behind'],
  adj1: ['happy', 'sad', 'big', 'small', 'fine', 'hot', 'cold', 'new', 'red', 'Happy'],
  adj2: ['tall', 'short', 'great', 'late', 'fast', 'slow', 'busy', 'near', 'old', 'thirsty'],
  adj3: ['sunny', 'rainy', 'cloudy', 'snowy', 'windy', 'warm', 'cool'],
  adj4: ['quiet', 'delicious', 'tired', 'expensive', 'brave', 'wrong', 'boring', 'exciting', 'surprised', 'important', 'famous'],
  col: ['red', 'blue', 'green', 'yellow', 'black', 'white', 'pink', 'brown'],
  num: ['one', 'two', 'three', 'four', 'five', 'six', 'ten'],
  day: ['Monday', 'Tuesday', 'Wednesday', 'Friday', 'Sunday', 'Saturday'],
  time: ['morning', 'afternoon', 'evening', 'night'],
  adv: ['down', 'up', 'straight', 'again', 'together', 'well'],
  freq: ['usually', 'always', 'often', 'never', 'sometimes'],
  conj: ['Because', 'Although', 'However', 'But', 'So', 'If'],
  comp: ['more', 'most', 'tallest', 'better', 'best', 'same'],
  job: ['teacher', 'doctor', 'nurse', 'pilot', 'cook', 'farmer', 'singer', 'driver'],
  n1: ['dog', 'cat', 'mom', 'dad', 'ball', 'book', 'bird', 'sun'],
  n2: ['school', 'pencil', 'chair', 'table', 'park', 'bag', 'sea', 'sky', 'friend'],
  n3: ['day', 'math', 'park', 'time', 'lunch', 'music', 'homework', 'summer', 'tomorrow', 'years', 'picnic'],
  n4: ['library', 'bank', 'museum', 'station', 'market', 'coat', 'ticket'],
  n5: ['hobby', 'plan', 'headache', 'dream', 'goal', 'idea'],
  n6: ['environment', 'energy', 'Pollution', 'Technology', 'effort', 'culture'],
};
