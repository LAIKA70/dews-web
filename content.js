/* DEWS v2 — content.
 * Every safety instruction here is taken from an official Australian source
 * listed in SOURCES. Do not add guidance without a source. Checked 2026-10-23.
 * Each text is [English, 中文].
 */
var DEWS_VERSION = '2.1.0';
var CONTENT_CHECKED = '2026-10-23';

var SOURCES = {
  aws:   { t: 'NSW Government — Understand the warnings', u: 'https://www.nsw.gov.au/emergency/get-ready/warnings/warning-system' },
  awsq:  { t: 'Queensland Government — Watch for the warnings', u: 'https://www.disaster.qld.gov.au/watch-for-the-warnings' },
  kit:   { t: 'Get Ready Queensland — Emergency kit', u: 'https://getready.qld.gov.au/emergencykit' },
  ses:   { t: 'NSW SES — Emergency', u: 'https://www.ses.nsw.gov.au/plan-and-prepare/emergency' },
  flood: { t: 'NSW SES — During a flood', u: 'https://www.ses.nsw.gov.au/during-emergency/during-flood' },
  storm: { t: 'NSW SES — During a storm', u: 'https://www.ses.nsw.gov.au/during-emergency/during-storm' },
  fire:  { t: 'NSW RFS — Leaving early factsheet', u: 'https://www.rfs.nsw.gov.au/__data/assets/pdf_file/0020/9425/Leaving-Early-Factsheet.pdf' },
  heat:  { t: 'SecureNT — Heatwave', u: 'https://securent.nt.gov.au/prepare-for-an-emergency/weather-events/heatwave' },
  quake: { t: 'DFES WA — During an earthquake', u: 'https://dfes.wa.gov.au/hazard-information/earthquake/during' }
};

/* Australian Warning System — three levels */
var LEVELS = {
  advice:    { name: ['Advice', '建议'], color: 'advice',
               desc: ['An incident has started. There is no immediate danger. Stay up to date in case the situation changes.',
                      '事件已经发生，目前没有直接危险。请随时关注，以防情况变化。'] },
  watch:     { name: ['Watch and Act', '注意并行动'], color: 'watch',
               desc: ['There is a heightened level of threat. Conditions are changing — start taking action now.',
                      '威胁程度上升，情况正在变化。现在就开始采取行动。'] },
  emergency: { name: ['Emergency Warning', '紧急警告'], color: 'emergency',
               desc: ['The highest level of warning. You may be in danger and need to act immediately.',
                      '最高级别警告。你可能有危险，需要立即行动。'] }
};

/* Hazards. Each has a fork question; each answer leads to steps.
 * The first step of each branch is the one to do right now. */
var HAZARDS = [
  { id: 'fire', icon: 'fire', src: 'fire',
    name: ['Bushfire', '山火'],
    fork: { q: ['Can you leave safely right now?', '你现在能安全离开吗？'],
      options: [
        { id: 'leave', label: ['Yes — I can leave', '能，我可以离开'], kind: 'evacuate',
          steps: [
            ['Leave now. Don’t wait for an official warning before deciding to leave.', '现在就走。不要等官方警告才决定离开。'],
            ['Take your emergency kit, medication and important documents.', '带上应急包、药品和重要证件。'],
            ['Account for everyone, including pets. Turn off gas, lock doors and windows.', '确认所有人（包括宠物）都在。关掉燃气，锁好门窗。'],
            ['Use a route away from the fire. Have a second route — roads can close quickly.', '走远离火场的路线，并准备第二条路线，道路可能很快封闭。'],
            ['Tell someone where you’re going, and tell them again when you arrive.', '告诉别人你要去哪里，到达后再告诉他们一次。']
          ] },
        { id: 'stay', label: ['No — I’m trapped or unsure', '不能，被困或不确定'], kind: 'shelter',
          steps: [
            ['If your life is in danger, call 000 now.', '如果有生命危险，立刻拨打 000。'],
            ['Shelter in a room on the side of the house away from the fire, with a clear way out.', '躲进房子背对火场一侧的房间，并确保有通畅的出口。'],
            ['Close doors, windows and vents. Fill baths, sinks and buckets with water.', '关闭门、窗和通风口。把浴缸、水槽和水桶装满水。'],
            ['Lay wet towels or rugs across outside doorways. Move furniture away from windows.', '把湿毛巾或地毯铺在通往室外的门口，把家具搬离窗边。'],
            ['Don’t climb onto the roof.', '不要爬上屋顶。']
          ] }
      ] } },

  { id: 'flood', icon: 'flood', src: 'flood',
    name: ['Flood', '洪水'],
    fork: { q: ['Can you leave safely right now?', '你现在能安全离开吗？'],
      options: [
        { id: 'leave', label: ['Yes — roads are still open', '能，道路还通'], kind: 'evacuate',
          steps: [
            ['Leave early, before roads are closed.', '尽早离开，赶在道路封闭之前。'],
            ['Never enter floodwater — not on foot, on a bike or in a car.', '绝对不要进入洪水，步行、骑车、开车都不行。'],
            ['Move to higher ground.', '转移到地势高的地方。'],
            ['If the road ahead is flooded, turn around and find another way, or wait.', '如果前方道路被淹，掉头找别的路，或者等水退。']
          ] },
        { id: 'stay', label: ['No — water is around me', '不能，水已经到身边'], kind: 'shelter',
          steps: [
            ['If your life is in danger, call 000 now.', '如果有生命危险，立刻拨打 000。'],
            ['Go to the highest part of a sturdy building, or to high ground.', '到坚固建筑的最高处，或者到高地上。'],
            ['Don’t enter floodwater.', '不要进入洪水。'],
            ['For flood help that isn’t life-threatening, call the SES on 132 500.', '如果需要帮助但没有生命危险，拨打 SES 132 500。'],
            ['Later: throw out food and drink, including water, that touched floodwater.', '之后：所有碰过洪水的食物和饮品（包括水）都要扔掉。']
          ] }
      ] } },

  { id: 'storm', icon: 'storm', src: 'storm',
    name: ['Storm', '风暴'],
    fork: { q: ['Are you inside a building?', '你现在在室内吗？'],
      options: [
        { id: 'inside', label: ['Yes — I’m inside', '是，在室内'], kind: 'shelter',
          steps: [
            ['Stay inside and keep clear of windows.', '待在室内，远离窗户。'],
            ['Avoid travel unless it’s essential.', '除非必要，不要出行。'],
            ['For storm damage help, call the SES on 132 500. If life is in danger, call 000.', '风暴造成损坏需要帮助，拨打 SES 132 500；有生命危险拨打 000。']
          ] },
        { id: 'outside', label: ['No — I’m outside or driving', '否，在室外或开车'], kind: 'shelter',
          steps: [
            ['Take cover in a secure shelter, away from trees, power lines, creeks and low-lying areas.', '到牢固的地方躲避，远离树木、电线、小溪和低洼地。'],
            ['Treat fallen power lines as live. Stay at least 8 metres (2 car lengths) away.', '倒下的电线一律当作带电，至少保持 8 米（约两个车身）距离。'],
            ['Never drive through a flash-flooded road. Turn around or wait for the water to drop.', '绝不开车穿过被淹的道路。掉头，或等水退下去。']
          ] }
      ] } },

  { id: 'heat', icon: 'heat', src: 'heat',
    name: ['Heatwave', '热浪'],
    fork: { q: ['Is anyone confused, staggering or collapsed?', '有人意识混乱、站不稳或晕倒吗？'],
      options: [
        { id: 'sick', label: ['Yes', '有'], kind: 'contain',
          steps: [
            ['Call 000 for an ambulance now. Heatstroke needs immediate medical help.', '立刻拨打 000 叫救护车。中暑需要马上就医。'],
            ['Follow what the 000 call-taker tells you.', '按照 000 接线员的指示去做。']
          ] },
        { id: 'ok', label: ['No — everyone is OK', '没有，大家都还好'], kind: 'shelter',
          steps: [
            ['Drink at least 3 litres of water a day, even if you’re not thirsty.', '每天至少喝 3 升水，不渴也要喝。'],
            ['Spend as much time as you can indoors in air-conditioning.', '尽量待在有空调的室内。'],
            ['Avoid direct sunlight. Use SPF30+ sunscreen.', '避免阳光直射，涂 SPF30 以上的防晒霜。'],
            ['Never leave children or pets in a parked car.', '绝对不要把孩子或宠物留在停着的车里。']
          ] }
      ] } },

  { id: 'quake', icon: 'quake', src: 'quake',
    name: ['Earthquake', '地震'],
    fork: { q: ['Where are you?', '你现在在哪里？'],
      options: [
        { id: 'in', label: ['Indoors', '室内'], kind: 'shelter',
          steps: [
            ['Drop, cover and hold on under a sturdy table. Staying indoors is safest.', '趴下、掩护、抓牢，躲在坚固的桌子下。待在室内最安全。'],
            ['No table nearby? Crouch beside an inside wall.', '附近没有桌子？就蹲在内墙边。'],
            ['Stay clear of windows, glass and anything that could fall.', '远离窗户、玻璃和可能掉落的东西。'],
            ['Don’t use flames — gas may be leaking.', '不要用明火，可能有燃气泄漏。']
          ] },
        { id: 'out', label: ['Outdoors', '室外'], kind: 'shelter',
          steps: [
            ['Drop, cover and hold on, away from buildings, power lines and trees.', '趴下、掩护、抓牢，远离建筑、电线和树木。'],
            ['At the beach and shaking lasts over 60 seconds? Move to higher ground — a tsunami may follow.', '在海边，摇晃超过 60 秒？马上往高处走，可能会有海啸。']
          ] },
        { id: 'car', label: ['In a car', '车里'], kind: 'shelter',
          steps: [
            ['Stop in an open area and stay in the car until the shaking stops.', '在空旷处停车，待在车里直到摇晃停止。']
          ] }
      ] } }
];

/* Response archetypes — what the step list is asking you to do */
var KINDS = {
  evacuate: ['Leave', '撤离'],
  shelter:  ['Shelter', '就地避险'],
  contain:  ['Get help', '求助']
};

/* Emergency kit — Get Ready Queensland */
var KIT = {
  waterPerPerson: 10,   /* litres, minimum, for three days */
  days: 3,
  items: [
    ['water', 'Drinking water', '饮用水'],
    ['food', 'Non-perishable food for three days', '三天的不易变质食物'],
    ['firstaid', 'First aid kit', '急救包'],
    ['meds', 'Essential medication', '必需药品'],
    ['docs', 'Important documents (passport, visa, insurance)', '重要证件（护照、签证、保险）'],
    ['charger', 'Phone, charger and power bank', '手机、充电器和充电宝'],
    ['radio', 'Battery-powered radio', '电池收音机'],
    ['torch', 'Torch and spare batteries', '手电筒和备用电池'],
    ['gloves', 'Sturdy gloves', '结实的手套'],
    ['hygiene', 'Toiletries, wipes, hand sanitiser, face mask', '洗漱用品、湿巾、洗手液、口罩'],
    ['opener', 'Can opener', '开罐器'],
    ['whistle', 'Whistle', '哨子'],
    ['cash', 'Spare cash', '备用现金'],
    ['clothes', 'Spare clothes and a warm blanket', '备用衣物和保暖毯']
  ],
  baby: ['baby', 'Baby supplies', '婴儿用品'],
  pet:  ['pet', 'Pet food and supplies', '宠物食品和用品']
};

/* Scenario quiz */
var QUIZ = [
  { q: ['A road ahead is covered by water. It looks shallow. What do you do?', '前面的路被水淹了，看起来不深。你会怎么做？'],
    a: [['Drive through slowly', '慢慢开过去'], ['Turn around, find another route or wait', '掉头、换路或等待'], ['Walk across to check the depth', '先走过去试试深浅']],
    ok: 1, why: ['Never drive through a flooded road. Turn around, find a safer route, or wait for the water to drop.', '永远不要开车穿过被淹的路。掉头、换一条更安全的路，或者等水退。'], src: 'storm' },
  { q: ['There’s a bushfire in your area. When should you decide to leave?', '你所在的区域有山火。你应该什么时候决定离开？'],
    a: [['When I can see flames', '看到火的时候'], ['When police knock on the door', '警察来敲门的时候'], ['Early — don’t wait for an official warning', '尽早，不要等官方警告']],
    ok: 2, why: ['“Do not wait for an official warning before deciding to leave.” Set your leave trigger in advance.', '“不要等到官方警告才决定离开。”提前定好你的撤离条件。'], src: 'fire' },
  { q: ['A power line has fallen across your street. How far away should you stay?', '一根电线倒在你家街上。你应该离它多远？'],
    a: [['1 metre', '1 米'], ['At least 8 metres — about 2 car lengths', '至少 8 米，约两个车身'], ['It’s safe if it isn’t sparking', '没冒火花就安全']],
    ok: 1, why: ['Treat fallen lines as live and keep back at least 8 metres.', '倒下的电线一律当作带电，至少保持 8 米距离。'], src: 'storm' },
  { q: ['The ground starts shaking while you’re in your room. What’s safest?', '你在房间里，地面开始摇晃。怎样最安全？'],
    a: [['Run outside', '跑到外面'], ['Drop, cover and hold on under a sturdy table', '趴下、掩护、抓牢，躲在坚固的桌子下'], ['Stand next to the window', '站到窗边']],
    ok: 1, why: ['Staying indoors is safest. Drop, cover and hold on, away from windows and glass.', '待在室内最安全。趴下、掩护、抓牢，远离窗户和玻璃。'], src: 'quake' },
  { q: ['Your flat has a leaking roof after a storm. No one is hurt. Who do you call?', '风暴后你家屋顶漏水，没人受伤。你打给谁？'],
    a: [['000', '000'], ['SES on 132 500', 'SES 132 500'], ['Nobody', '不用打']],
    ok: 1, why: ['Call the SES on 132 500 for flood, storm or tsunami help. Save 000 for life-threatening emergencies.', '洪水、风暴、海啸需要帮助打 SES 132 500。000 留给有生命危险的情况。'], src: 'ses' },
  { q: ['A warning for your area changes from Advice to Watch and Act. What does that mean?', '你所在区域的预警从“建议”升级为“注意并行动”。这代表什么？'],
    a: [['Nothing to do yet', '暂时不用做什么'], ['Conditions are changing — start taking action now', '情况在变化，现在就开始行动'], ['The danger has passed', '危险已经过去']],
    ok: 1, why: ['Watch and Act means a heightened threat. Conditions are changing and you should act now.', '“注意并行动”代表威胁上升，情况在变化，应该现在就行动。'], src: 'aws' },
  { q: ['It’s 43°C. How much water should you drink today?', '今天 43°C，你今天应该喝多少水？'],
    a: [['Only when thirsty', '渴了再喝'], ['At least 3 litres, even if not thirsty', '至少 3 升，不渴也要喝'], ['1 cup an hour of soft drink', '每小时一杯汽水']],
    ok: 1, why: ['Drink at least 3 litres of water per day in a heatwave, even if you’re not thirsty.', '热浪期间每天至少喝 3 升水，即使不渴。'], src: 'heat' },
  { q: ['After a flood, a sealed bottle of water was sitting in floodwater. Is it OK to drink?', '洪水过后，一瓶密封的水泡过洪水。还能喝吗？'],
    a: [['Yes, it was sealed', '能，因为是密封的'], ['Throw it out', '扔掉'], ['Boil it first', '先烧开']],
    ok: 1, why: ['Throw out food and drink, including water, that has been in contact with floodwater.', '所有接触过洪水的食物和饮品，包括水，都要扔掉。'], src: 'flood' }
];

/* Sample data — clearly marked as sample in the UI */
var SAMPLE_ALERT = {
  hazard: 'fire', level: 'emergency',
  area: ['Sample Ridge (demo area)', '示例山区（演示区域）'],
  action: ['Leave now', '立即撤离'],
  issued: '16:05'
};

var SAMPLE_PLACES = [
  { type: 'shelter', name: ['Evacuation centre — Community Hall', '疏散中心：社区礼堂'], note: ['Open now · bring your kit', '现已开放 · 带上应急包'], dx: 260, dy: -380 },
  { type: 'hospital', name: ['Hospital emergency department', '医院急诊部'], note: ['24 hours', '24 小时'], dx: 1050, dy: 420 },
  { type: 'water', name: ['Drinking water point', '饮用水供应点'], note: ['Standpipe near the park gate', '公园大门旁的水龙头'], dx: -150, dy: 560 },
  { type: 'power', name: ['Phone charging — Library', '充电点：图书馆'], note: ['9am–6pm', '上午 9 点至下午 6 点'], dx: -720, dy: -90 },
  { type: 'shelter', name: ['Evacuation centre — High School', '疏散中心：中学'], note: ['Opens if needed', '必要时开放'], dx: -820, dy: -1180 }
];

var PLACE_TYPES = {
  assembly: { icon: 'users', name: ['Assembly point', '集合点'] },
  shelter:  { icon: 'home', name: ['Shelter', '避难所'] },
  hospital: { icon: 'cross', name: ['Hospital', '医院'] },
  rescue:   { icon: 'shield', name: ['Fire / police', '消防 / 警察'] },
  water:    { icon: 'drop', name: ['Water', '饮水'] },
  power:    { icon: 'bolt', name: ['Power', '充电'] }
};

/* Interface text */
var STR = {
  appSub: ['Disaster readiness, in your language', '用你的语言，为灾害做好准备'],
  tabHome: ['Today', '今天'], tabPrep: ['Prepare', '准备'], tabMap: ['Nearby', '附近'], tabMe: ['Me', '我的'],
  sos: ['Emergency', '紧急'],
  offlineReady: ['Works offline', '离线可用'], offlineNot: ['Saving for offline…', '正在保存离线版…'],
  youreOffline: ['You’re offline — everything here still works.', '你已离线，这里的功能照常可用。'],
  sample: ['Sample', '示例'], sampleData: ['Sample data — not a real warning', '示例数据，不是真实预警'],
  yourArea: ['Your area', '你所在的区域'],
  noWarnings: ['No warnings near you', '附近没有预警'],
  imIn: ['I’m in an emergency', '我遇到紧急情况'],
  imInSub: ['Step-by-step help, call 000, tell family you’re safe', '分步指引、拨打 000、给家人报平安'],
  readiness: ['Your readiness', '你的准备度'],
  nextStep: ['Next step', '下一步'],
  numbers: ['Numbers to know', '要记住的电话'],
  n000: ['Life-threatening emergency', '有生命危险的紧急情况'],
  n132: ['SES — flood and storm help', 'SES：洪水和风暴求助'],
  call: ['Call', '拨打'],
  affectedQ: ['Are you affected by this right now?', '你现在受到影响了吗？'],
  yes: ['Yes', '是'], no: ['No', '否'],
  needHelpQ: ['Do you need help?', '你需要帮助吗？'],
  needHelp: ['I need help', '我需要帮助'], imSafe: ['I’m safe', '我很安全'],
  back: ['Back', '返回'], close: ['Close', '关闭'], done: ['Done', '完成'], next: ['Next', '下一步'], save: ['Save', '保存'],
  exitEmergency: ['Exit', '退出'],
  emTitle: ['What’s happening?', '发生了什么？'],
  emCall: ['Call 000', '拨打 000'],
  emSafe: ['Tell family I’m safe', '给家人报平安'],
  emHelp: ['Request help', '请求救援'],
  emTools: ['Tools', '工具'],
  doNow: ['Do this now', '现在就做'],
  then: ['Then', '然后'],
  source: ['Source', '来源'], checked: ['checked', '核对于'],
  otherOption: ['Not right? Choose again', '不对？重新选择'],
  torch: ['Torch', '手电筒'], sosFlash: ['SOS light', 'SOS 闪光'], whistle: ['Whistle', '哨子'], showCard: ['Show to others', '给别人看'],
  tapToStop: ['Tap anywhere to stop', '点任意处停止'],
  torchNote: ['Screen at full brightness. Turn your brightness up.', '屏幕全亮。请把亮度调到最高。'],
  whistleNote: ['Three blasts at a time', '三声一组'],
  flashNote: ['Flashes S-O-S slowly', '缓慢闪烁 S-O-S'],
  helpCardTitle: ['I need help', '我需要帮助'],
  helpCardLang: ['I speak', '我说'],
  helpCardCall: ['Please call 000 for me.', '请帮我拨打 000。'],
  /* help request */
  hrTitle: ['Request help', '请求救援'],
  hrDemo: ['Demo: this version doesn’t send anything to a real agency. If your life is in danger, call 000.', '演示版：这个版本不会真的发送给救援机构。如有生命危险，请拨打 000。'],
  hrInjured: ['Is anyone hurt?', '有人受伤吗？'],
  injNone: ['No one', '没有'], injMinor: ['Minor injuries', '轻伤'], injSerious: ['Serious injury', '重伤'],
  seriousCall: ['Serious injury: call 000 first. Then come back.', '有重伤：先拨打 000，再回来继续。'],
  hrPeople: ['How many people are with you?', '你身边一共几个人？'],
  hrNeed: ['What do you need most?', '你最需要什么？'],
  needWater: ['Water', '饮用水'], needFood: ['Food', '食物'], needMeds: ['Medicine', '药品'], needShelter: ['Shelter', '避难所'], needTransport: ['Transport out', '撤离交通'], needPower: ['Phone charging', '手机充电'],
  hrNote: ['Anything else? (optional)', '还有别的吗？（可选）'],
  hrNotePh: ['e.g. 2nd floor, can’t use stairs', '例如：在二楼，无法走楼梯'],
  hrShareLoc: ['Share my location', '分享我的位置'],
  hrIncludeCard: ['Include my emergency card', '附上我的应急卡'],
  hrSend: ['Send request', '发送求助'],
  hrSent: ['Request received', '求助已收到'],
  hrSentTo: ['Sent to: Sample Relief Agency (demo)', '已发送至：示例救援机构（演示）'],
  hrEta: ['Estimated time until someone contacts you', '预计多久后有人联系你'],
  hrEtaVal: ['about 25 min', '约 25 分钟'],
  hrEtaNote: ['This time comes from the agency, not from DEWS. Sample value.', '这个时间由救援机构给出，不是 DEWS 算的。此处为示例。'],
  hrWhile: ['While you wait', '等待时'],
  hrWhile1: ['Stay where you said you are, if it’s safe.', '如果安全，留在你报告的位置。'],
  hrWhile2: ['Save phone battery — lower brightness, close other apps.', '节省电量：调低亮度，关掉其他应用。'],
  hrWhile3: ['If things get worse, call 000.', '情况变糟就拨打 000。'],
  hrAlsoSms: ['Also text my contacts', '同时发短信给我的联系人'],
  /* safe */
  safeMsg: ['I’m safe. — sent from DEWS', '我很安全。—— 来自 DEWS'],
  safeNoContacts: ['Add contacts in your plan first', '请先在计划里添加联系人'],
  safeWhere: ['My location', '我的位置'],
  /* prepare */
  prepTitle: ['Prepare', '准备'],
  prepSub: ['A little each week. Everything is saved on this phone only.', '每周做一点。所有内容只保存在这台手机上。'],
  kitTitle: ['Emergency kit', '应急包'],
  kitSub: ['Enough for three days', '够用三天'],
  kitPeople: ['People', '人数'], kitBaby: ['Baby', '婴儿'], kitPet: ['Pets', '宠物'],
  kitWater: ['Water to store', '需储存的水'], kitLitres: ['litres minimum', '升（最少）'],
  kitHave: ['packed', '已备好'],
  planTitle: ['Household plan', '家庭 / 合租计划'],
  planSub: ['Who to call, where to meet, when to leave', '打给谁、在哪集合、什么时候走'],
  planPeople: ['People in your home', '住在一起的人'],
  planAdd: ['Add person', '添加'],
  planName: ['Name', '名字'], planPhone: ['Phone', '电话'],
  planMeetNear: ['Meeting point near home', '家附近的集合点'],
  planMeetNearPh: ['e.g. Front gate of the park on King St', '例如：King St 公园正门'],
  planMeetFar: ['Meeting point outside your suburb', '区外的集合点'],
  planMeetFarPh: ['e.g. A friend’s place in another suburb', '例如：另一个区的朋友家'],
  planContact: ['Contact outside the area', '外地联系人'],
  planContactPh: ['Someone far away everyone can call', '大家都能联系上的远方的人'],
  planTrigger: ['We leave when…', '我们什么情况下离开'],
  planTriggerPh: ['e.g. Watch and Act for our area, or a Catastrophic fire danger day', '例如：本区出现“注意并行动”，或火险等级为“灾难级”'],
  planShare: ['Share plan', '分享计划'],
  quizTitle: ['Scenario practice', '情景练习'],
  quizSub: ['Think it through before it happens', '事前想清楚，事发不慌'],
  quizStart: ['Start', '开始'], quizAgain: ['Try again', '再来一次'],
  quizScore: ['You got', '你答对了'],
  quizCorrect: ['Correct', '答对了'], quizWrong: ['Not quite', '不太对'],
  /* map */
  mapTitle: ['Nearby help', '附近的帮助'],
  mapSub: ['Sample places around you. Distances are straight-line.', '你周围的示例地点。距离为直线距离。'],
  mapAll: ['All', '全部'],
  mapLocate: ['Use my location', '使用我的位置'],
  mapLocating: ['Finding you…', '正在定位…'],
  mapNoLoc: ['Showing a sample position', '显示的是示例位置'],
  mapCompass: ['Turn on compass', '打开指南针'],
  mapOpen: ['Directions', '导航'],
  mapOnlineOnly: ['needs internet', '需要网络'],
  /* me */
  meTitle: ['Me', '我的'],
  cardTitle: ['Emergency card', '应急卡'],
  cardSub: ['For first responders. Shown in English.', '给救援人员看，以英文显示。'],
  cardEdit: ['Edit', '编辑'],
  cardEmpty: ['Add your details so responders can help you faster.', '填写你的信息，救援人员能更快帮到你。'],
  fName: ['Full name', '全名'], fLang: ['Language I speak', '我说的语言'], fBlood: ['Blood type', '血型'],
  fAllergies: ['Allergies', '过敏'], fMeds: ['Medications', '正在用的药'], fConditions: ['Medical notes', '医疗备注'],
  fContact: ['Emergency contact', '紧急联系人'], fAddress: ['Address', '地址'],
  cardPrivacy: ['Saved only on this phone. Never uploaded.', '只保存在这台手机上，不会上传。'],
  settings: ['Settings', '设置'],
  language: ['Language', '语言'],
  textSize: ['Text size', '字号'], sizeStd: ['Standard', '标准'], sizeLg: ['Large', '大'], sizeXl: ['Extra large', '特大'],
  theme: ['Appearance', '外观'], themeAuto: ['Auto', '自动'], themeLight: ['Light', '浅色'], themeDark: ['Dark', '深色'],
  demoAlert: ['Simulate a warning', '模拟一条预警'],
  demoAlertSub: ['See how DEWS checks in with you', '看看 DEWS 会怎样询问你'],
  sourcesTitle: ['Where our advice comes from', '内容来源'],
  sourcesSub: ['Every instruction comes from an official Australian source.', '每条指引都来自澳大利亚官方来源。'],
  about: ['About', '关于'],
  aboutText: ['DEWS is a preparedness guide. It doesn’t replace official warnings or emergency services. In a life-threatening emergency, call 000.', 'DEWS 是一个应急准备指南，不能替代官方预警或紧急服务。遇到生命危险，请拨打 000。'],
  version: ['Version', '版本'],
  oldVersion: ['Open version 1', '打开第 1 版'],
  reset: ['Delete all my data', '删除我的全部数据'],
  resetConfirm: ['Tap again to delete everything', '再点一次确认删除'],
  /* onboarding */
  obTitle: ['Choose your language', '选择你的语言'],
  obSub: ['You can change this any time in Me.', '之后可以随时在“我的”里修改。'],
  obNote: ['DEWS works without signal once it has loaded. It is a guide — it does not replace 000.', 'DEWS 加载一次后，没有信号也能用。它是一个指南，不能替代 000。'],
  obStart: ['Start', '开始'],
  /* home next steps */
  nsCard: ['Fill in your emergency card', '填写你的应急卡'],
  nsPlan: ['Add your household plan', '填写家庭 / 合租计划'],
  nsKit: ['Pack your emergency kit', '准备应急包'],
  nsQuiz: ['Try a 2-minute scenario practice', '做一次 2 分钟的情景练习'],
  nsDone: ['You’re well prepared. Review your plan every few months.', '你已经准备得很好了。每隔几个月复查一次计划。'],
  issued: ['Issued', '发布于'],
  whatToDo: ['What to do', '该怎么做']
};

/* v2.1 — guidance, map, onboarding */
var STR21 = {
  guideTitle: ['Nearest safe place', '最近的安全点'],
  guideEnable: ['Turn on location and compass', '开启定位和指南针'],
  guideEnableSub: ['DEWS will point you to the nearest safe place.', 'DEWS 会直接指向最近的安全点。'],
  guideLocating: ['Finding your location…', '正在定位…'],
  guideDenied: ['Location is off. Turn it on in your phone settings to get directions.', '定位已关闭。请在手机设置里打开，才能指路。'],
  compassTap: ['Tap to turn on the compass', '点一下开启指南针'],
  compassNone: ['No compass on this device — the arrow points north-up.', '这台设备没有指南针，箭头以正北为上。'],
  viaRoute: ['along the walking route', '沿步行路线'],
  straight: ['straight line — follow roads and paths', '直线方向，请沿道路走'],
  minWalk: ['min walk', '分钟步行'],
  openMap: ['Open map', '打开地图'],
  goTitle: ['Get to safety', '前往安全点'],
  nextPlace: ['Next nearest', '换一个'],
  recenter: ['Show me and the target', '显示我和目的地'],
  followHeading: ['Rotate map with me', '地图跟随朝向'],
  srcOsm: ['Places from OpenStreetMap (community data).', '地点来自 OpenStreetMap（社区数据）。'],
  srcCache: ['Saved places — works offline.', '已保存的地点，离线可用。'],
  srcSample: ['Sample places — not real.', '示例地点，不是真实地点。'],
  officialNote: ['Official evacuation centres are announced by emergency services during an event. Follow their instructions first.', '官方疏散中心会在灾害发生时由应急部门公布，请优先听从官方指示。'],
  hazardWarn: ['Never walk toward fire, smoke or floodwater, even if the arrow points that way.', '即使箭头指向那里，也绝不要朝火、烟或洪水走。'],
  mapFailed: ['The map can’t load right now — directions still work.', '地图暂时无法加载，方向指引仍可使用。'],
  arrived: ['You’re there', '已到达'],
  startGuide: ['Start directions', '开始指路'],
  mapLoading: ['Loading map…', '正在加载地图…'],
  away: ['away', ''],
  dStraight: ['Walk straight ahead', '直走'], dBearR: ['Bear right', '稍向右走'], dRight: ['Turn right', '向右转'], dBackR: ['Turn back, to your right', '向右后方走'],
  dAround: ['Turn around', '掉头走'], dBackL: ['Turn back, to your left', '向左后方走'], dLeft: ['Turn left', '向左转'], dBearL: ['Bear left', '稍向左走'],
  dHead: ['Head', '朝'], dHeadSuffix: ['', '方向走'],
  /* onboarding */
  obContinue: ['Continue', '继续'], obNext: ['Next', '下一步'], obSkip: ['Skip', '跳过'], obBack: ['Back', '上一步'],
  ob1T: ['Welcome to DEWS', '欢迎使用 DEWS'],
  ob1D: ['Get ready before a disaster, and know what to do during one. Once loaded, it works without signal.', '灾害前做好准备，灾害中知道该做什么。加载一次后，没有信号也能用。'],
  ob2T: ['Emergency', '紧急'],
  ob2D: ['On any screen, tap the red button: call 000, tell family you’re safe, get step-by-step help and directions to safety.', '任何页面点右上角红色按钮：拨打 000、给家人报平安、看分步指引，并指向安全点。'],
  ob3T: ['Today', '今天'], ob3D: ['Warnings for your area, and how prepared you are.', '你所在区域的预警，和你的准备进度。'],
  ob4T: ['Prepare', '准备'], ob4D: ['Work out your emergency kit, make a household plan and practise scenarios.', '算出应急包、写好家庭计划、做情景练习。'],
  ob5T: ['Nearby', '附近'], ob5D: ['A live map of the nearest hospitals, assembly points and drinking water.', '实时地图，找到最近的医院、集合点和饮水点。'],
  ob6T: ['Me', '我的'], ob6D: ['Your emergency card for responders, plus text size and appearance.', '给救援人员看的应急卡，以及字号和外观设置。'],
  obPermT: ['Let DEWS guide you', '让 DEWS 为你指路'],
  obPermD: ['Allow location and compass now, so in an emergency DEWS can point the way straight away. Your location is only used to find places and routes near you. DEWS has no server and keeps no record.', '现在允许定位和指南针，紧急时 DEWS 就能立刻指路。你的位置只用于查找附近的地点和路线。DEWS 没有服务器，不保存任何记录。'],
  obAllow: ['Allow location & compass', '允许定位和指南针'], obLater: ['Not now', '以后再说'],
  glass: ['Glass effect', '玻璃效果'], glassOn: ['On', '开'], glassOff: ['Off (more solid)', '关（更清晰）']
};
for (var k21 in STR21) STR[k21] = STR21[k21];
