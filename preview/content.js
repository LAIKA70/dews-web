/* DEWS v2 — content.
 * Every safety instruction here is taken from an official Australian source
 * listed in SOURCES. Do not add guidance without a source. Checked 2026-10-23.
 * Each text is [English, 中文].
 */
var DEWS_VERSION = '2.2.0';
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
  shelter:  ['Shelter', '避险'],
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
  assembly: { icon: 'users', name: ['Emergency assembly area', '紧急集合区'] },
  shelter:  { icon: 'home', name: ['Evacuation centre', '疏散中心'] },
  nsp:      { icon: 'home', name: ['Neighbourhood Safer Place', '邻里避险点'] },
  hospital: { icon: 'cross', name: ['Hospital', '医院'] },
  clinic:   { icon: 'cross', name: ['Clinic or GP', '诊所'] },
  police:   { icon: 'shield', name: ['Police station', '警察局'] },
  fire:     { icon: 'fire', name: ['Fire station', '消防站'] },
  ses:      { icon: 'storm', name: ['SES unit', 'SES 救援站'] },
  ev:       { icon: 'bolt', name: ['EV charging', '电动车充电站'] },
  phone:    { icon: 'phone', name: ['Phone charging', '手机充电点'] },
  rescue:   { icon: 'shield', name: ['Fire or police station', '消防站或警察局'] },
  water:    { icon: 'drop', name: ['Drinking water', '饮用水'] },
  power:    { icon: 'bolt', name: ['Charging', '充电'] }
};

/* Interface text */
var STR = {
  appSub: ['Disaster readiness, in your language', '用你的语言，为灾害做好准备'],
  tabHome: ['Today', '今天'], tabPrep: ['Prepare', '准备'], tabMap: ['Nearby', '附近'], tabMe: ['Profile', '个人档案'],
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
  helpCardLang: ['I speak', '我会说'],
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
  planAdd: ['Add person', '添加人员'],
  planName: ['Name', '名字'], planPhone: ['Phone', '电话'],
  planMeetNear: ['Meeting point near home', '家附近的集合点'],
  planMeetNearPh: ['e.g. Front gate of the park on King St', '例如：King St 公园正门'],
  planMeetFar: ['Meeting point outside your suburb', '区外的集合点'],
  planMeetFarPh: ['e.g. A friend’s place in another suburb', '例如：另一个区的朋友家'],
  planContact: ['Contact outside the area', '外地联系人'],
  planContactPh: ['Someone far away everyone can call', '住在外地、大家都能联系到的人'],
  planTrigger: ['We leave when…', '出现以下情况时，我们就离开：'],
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
  mapCompass: ['Turn on compass', '开启指南针'],
  mapOpen: ['Directions', '导航'],
  mapOnlineOnly: ['needs internet', '需要网络'],
  /* me */
  meTitle: ['Profile', '个人档案'],
  cardTitle: ['Emergency card', '应急卡'],
  cardSub: ['For first responders. Shown in English.', '给救援人员看，以英文显示。'],
  cardEdit: ['Edit', '编辑'],
  cardEmpty: ['Add your details so responders can help you faster.', '填写你的信息，救援人员能更快帮到你。'],
  fName: ['Full name', '全名'], fLang: ['Language I speak', '我说的语言'], fBlood: ['Blood type', '血型'],
  fAllergies: ['Allergies', '过敏'], fMeds: ['Medications', '正在服用的药物'], fConditions: ['Medical notes', '医疗备注'],
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
  obSub: ['You can change this later in Profile → Settings.', '之后可以在“个人档案 → 设置”里随时修改。'],
  obNote: ['Once loaded, DEWS works with no internet connection. It is a guide — it does not replace 000.', 'DEWS 加载一次后，没有网络也能用。它是一个指南，不能替代 000。'],
  obStart: ['Start', '开始'],
  /* home next steps */
  nsCard: ['Fill in your profile', '填写你的个人档案'],
  nsPlan: ['Add your household plan', '填写家庭 / 合租计划'],
  nsKit: ['Pack your emergency kit', '准备应急包'],
  nsQuiz: ['Try a 2-minute scenario practice', '做一次 2 分钟的情景练习'],
  nsDone: ['You’re well prepared. Review your plan every few months.', '你已经准备得很好了。每隔几个月复查一次计划。'],
  issued: ['Issued', '发布于'],
  whatToDo: ['What to do', '该怎么做']
};

/* v2.1 — guidance, map, onboarding */
var STR21 = {
  guideTitle: ['Nearest help point', '最近的求助地点'],
  guideEnable: ['Turn on location and compass', '开启定位和指南针'],
  guideEnableSub: ['DEWS will point you to the nearest place to get help.', 'DEWS 会直接指向最近的求助地点。'],
  guideLocating: ['Finding your location…', '正在定位…'],
  guideDenied: ['Location is off. Turn it on in your device settings to get directions, or set your location on the map.', '定位已关闭。请在设备设置里打开，或在地图上标出你的位置，才能指路。'],
  compassTap: ['Turn on compass', '开启指南针'],
  compassNone: ['No compass on this device — the arrow points north-up.', '这台设备没有指南针，箭头以正北为上。'],
  viaRoute: ['along the walking route', '沿步行路线'],
  straight: ['straight line — follow roads and paths', '直线方向，请沿道路走'],
  minWalk: ['min walk', '分钟步行'],
  openMap: ['Open map', '打开地图'],
  goTitle: ['Directions', '指路'],
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
  ob1D: ['Get ready before a disaster, and know what to do during one. Once loaded, it works with no internet connection.', '灾害前做好准备，灾害中知道该做什么。加载一次后，没有网络也能用。'],
  ob2T: ['Emergency', '紧急'],
  ob2D: ['On any screen, tap the red Emergency button to call 000, tell family you’re safe, get step-by-step help and directions to the nearest place to get help.', '在任何页面点红色的“紧急”按钮，可以拨打 000、给家人报平安、查看分步指引，并获得前往最近求助地点的指路。'],
  ob3T: ['Today', '今天'], ob3D: ['Warnings for your area, and how prepared you are.', '你所在区域的预警，和你的准备进度。'],
  ob4T: ['Prepare', '准备'], ob4D: ['Work out your emergency kit, make a household plan and practise scenarios.', '算出应急包、写好家庭计划、做情景练习。'],
  ob5T: ['Nearby', '附近'], ob5D: ['A live map of the nearest hospitals, fire and police stations, assembly areas and drinking water.', '实时地图，找到最近的医院、消防站和警察局、集合区和饮水点。'],
  ob6T: ['Profile', '个人档案'], ob6D: ['Your emergency card for responders, plus language, text size and appearance settings.', '给救援人员看的应急卡，以及语言、字号和外观设置。'],
  obPermT: ['Let DEWS guide you', '让 DEWS 为你指路'],
  obPermD: ['Allow location and compass now, so in an emergency DEWS can point the way straight away. Your location is only used to find places and routes near you. DEWS has no server and keeps no record.', '现在允许定位和指南针，紧急时 DEWS 就能立刻指路。你的位置只用于查找附近的地点和路线。DEWS 没有服务器，不保存任何记录。'],
  obAllow: ['Allow location & compass', '允许定位和指南针'], obLater: ['Not now', '以后再说'],
  glass: ['Glass effect', '玻璃效果'], glassOn: ['On', '开'], glassOff: ['Off (solid, easier to read)', '关（不透明，更易读）']
};
for (var k21 in STR21) STR[k21] = STR21[k21];

/* v2.2 — personal profile */
var NEEDS = [
  { group: 'mobility', items: [['wheelchair', 'Uses a wheelchair', '使用轮椅'], ['walkingAid', 'Uses crutches, a cane or a walker', '使用拐杖或助行器'], ['noStairs', 'Cannot use stairs', '无法走楼梯'], ['slow', 'Cannot walk far or fast', '无法走远或走快']] },
  { group: 'senses', items: [['vision', 'Blind or low vision', '视障 / 视力弱'], ['hearing', 'Deaf or hard of hearing', '听障 / 听力弱']] },
  { group: 'support', items: [['power', 'Needs powered medical equipment (e.g. oxygen, CPAP)', '需要用电的医疗设备（如制氧机、呼吸机）'], ['animal', 'Has an assistance animal', '有辅助犬 / 服务动物'], ['cognitive', 'Needs simple, step-by-step instructions', '需要简单、逐步的说明']] },
  { group: 'health', items: [['epipen', 'Carries an adrenaline auto-injector (EpiPen)', '随身带肾上腺素笔（EpiPen）'], ['pregnant', 'Pregnant', '怀孕']] }
];
var STR22 = {
  profileTitle: ['My profile', '个人档案'],
  profileSub: ['What responders and helpers should know about you. Shown in English on your emergency card.', '救援人员和帮助你的人需要知道的信息。会以英文显示在应急卡上。'],
  secBasic: ['About you', '基本信息'], secNeeds: ['Access and mobility', '无障碍与行动需要'], secHealth: ['Health', '健康'], secContact: ['Emergency contact', '紧急联系人'],
  needsHint: ['Tick all that apply. This helps responders bring the right help.', '勾选所有适用的项目，救援人员能带来合适的帮助。'],
  gMobility: ['Moving around', '行动'], gSenses: ['Seeing and hearing', '视力和听力'], gSupport: ['Support', '辅助'], gHealth: ['Health', '健康'],
  fDisability: ['Disability or condition (optional)', '残障或身体状况（可选）'],
  fDisabilityPh: ['e.g. Spinal cord injury, uses manual wheelchair', '例如：脊髓损伤，使用手动轮椅'],
  fAllergiesPh: ['e.g. Penicillin, peanuts — say if severe', '例如：青霉素、花生，严重的请注明'],
  profileShared: ['Your profile is included:', '会一并附上你的档案：'],
  stepsNote: ['Walking routes may include steps or steep paths. Check before you go.', '步行路线可能有台阶或陡坡，出发前请留意。']
};
for (var k22 in STR22) STR[k22] = STR22[k22];
STR.palette = ['Colour palette (trial)', '配色方案（试用）'];
STR.palA = ['Eucalypt', '桉叶']; STR.palB = ['Harbour', '港湾']; STR.palC = ['Colour-blind safe', '色盲友好']; STR.palInk = ['Original', '原版'];

/* v2.3 — learn about each hazard (MVP 2). Every item is from the source named in `src`. Checked 2026-10-23. */
SOURCES.fireWear = { t: 'NSW RFS — What to wear', u: 'https://www.rfs.nsw.gov.au/plan-and-prepare/prepare-your-family/what-to-wear' };
SOURCES.floodPrep = { t: 'Wingecarribee Shire Council (with NSW SES) — Floods', u: 'https://www.wsc.nsw.gov.au/Residents/Emergency-Information/Floods-and-Storms/Floods' };
SOURCES.stormPrep = { t: 'NSW Government — Prepare your home for storms', u: 'https://www.nsw.gov.au/emergency/storms/prepare-your-home' };
SOURCES.quakePrep = { t: 'DFES WA — Prepare for an earthquake', u: 'https://www.dfes.wa.gov.au/hazard-information/earthquake/prepare' };

var LEARN = {
  fire: {
    what: ['Fire in bush, grass or forest. Wind can push it fast, and embers can start new fires ahead of the main fire.', '发生在灌木、草地或森林里的火。风会让它迅速蔓延，飞溅的火星还会在主火线前方引燃新的火。'],
    prep: [
      ['Decide now what your household will do if a fire starts. On some days staying won’t be an option.', '现在就决定起火时全家怎么做。有些日子根本不能留下。'],
      ['Set your leave trigger in advance, e.g. a fire within a set distance.', '提前定好撤离条件，例如火在多远范围内就走。'],
      ['Know more than one route out — roads can close at short notice.', '准备不止一条离开的路线，道路可能很快封闭。']
    ],
    supplies: [
      ['f-clothes', 'Long-sleeved shirt and heavy cotton pants (wool, cotton drill or denim — not synthetic)', '长袖上衣和厚棉长裤（羊毛、棉斜纹布或牛仔布，不要合成纤维）'],
      ['f-boots', 'Sturdy leather boots or shoes, with wool or cotton socks', '结实的皮靴或皮鞋，配羊毛或棉袜'],
      ['f-hat', 'Wide-brimmed or hard hat', '宽檐帽或安全帽'],
      ['f-goggles', 'Glasses or goggles', '眼镜或护目镜'],
      ['f-gloves', 'Gloves', '手套'],
      ['f-mask', 'Non-synthetic mask or cloth for nose and mouth', '非合成材质的口罩或布，用来捂住口鼻']
    ],
    src: ['fire', 'fireWear']
  },
  flood: {
    what: ['Water covering land that is usually dry. Flash floods can rise within minutes, even where it hasn’t flooded before.', '平时干燥的地方被水淹没。山洪可能几分钟内暴涨，以前没淹过的地方也可能发生。'],
    prep: [
      ['Know your risk: near a creek, river, drain or low-lying area?', '了解风险：你住在小溪、河流、排水沟附近或低洼地吗？'],
      ['Set watch zones in the Hazards Near Me app.', '在 Hazards Near Me 应用里设置关注区域。'],
      ['Plan to leave low-lying areas early, before flooding — only if it’s safe.', '计划在洪水来之前尽早离开低洼地，前提是安全。'],
      ['Check on neighbours who may need extra help.', '关心可能需要额外帮助的邻居。']
    ],
    supplies: [
      ['w-container', 'Waterproof container for your emergency kit', '装应急包的防水容器'],
      ['w-bag', 'Waterproof bag for valuables and documents', '装贵重物品和证件的防水袋'],
      ['w-matches', 'Candles and waterproof matches', '蜡烛和防水火柴'],
      ['w-plan', 'Copy of your household emergency plan', '一份家庭应急计划的副本']
    ],
    src: ['floodPrep', 'flood']
  },
  storm: {
    what: ['Strong wind, heavy rain, hail or lightning. Storms bring down trees and power lines and can cause flash flooding.', '强风、暴雨、冰雹或雷电。风暴会吹倒树木和电线，还可能引发山洪。'],
    prep: [
      ['Choose your shelter room — usually the smallest room with the fewest windows.', '选好避险房间，通常是窗户最少的最小房间。'],
      ['Learn where to turn off water, power and gas.', '知道水、电、燃气的总开关在哪。'],
      ['Secure outdoor items like furniture.', '固定好户外物品，比如家具。'],
      ['Renting? Report roof or gutter problems to your property manager in writing.', '租房？屋顶或排水槽有问题，书面告知房屋中介。']
    ],
    supplies: [
      ['s-batteries', 'Tested spare batteries', '测试过的备用电池'],
      ['s-surge', 'Surge protectors for devices', '电器用的防浪涌插座']
    ],
    src: ['stormPrep', 'storm']
  },
  heat: {
    what: ['Several days of unusually high temperatures. Heat can make anyone sick, and can be life-threatening.', '连续几天异常高温。高温会让任何人生病，严重时会危及生命。'],
    prep: [
      ['Close curtains or blinds on sunny sides of your home; open windows at night.', '关上向阳一侧的窗帘或百叶窗，晚上开窗。'],
      ['Avoid hard physical activity in the heat.', '高温时避免剧烈活动。'],
      ['Limit alcohol, hot drinks and sugary drinks.', '少喝酒、热饮和含糖饮料。'],
      ['See a doctor if you have a long-term illness or feel unwell.', '有慢性病或感到不适时去看医生。']
    ],
    supplies: [
      ['h-water', 'Water — at least 3 litres per person per day', '饮用水：每人每天至少 3 升'],
      ['h-clothes', 'Light, loose, light-coloured clothes and a wide-brimmed hat', '轻薄、宽松、浅色的衣服和宽檐帽'],
      ['h-sunscreen', 'Sunscreen SPF30 or higher', 'SPF30 以上的防晒霜'],
      ['h-fan', 'Fan and damp towels if you have no air-conditioning', '没有空调时准备风扇和湿毛巾']
    ],
    src: ['heat']
  },
  quake: {
    what: ['Sudden shaking of the ground. Earthquakes are less common in Australia, but they do happen, with no warning.', '地面突然震动。澳洲地震较少，但确实会发生，而且没有预警。'],
    prep: [
      ['Find safe “Drop, Cover and Hold On” spots at home.', '在家里找好可以“趴下、掩护、抓牢”的安全位置。'],
      ['Secure tall or heavy furniture — shelves, bookcases, fridges.', '固定高大或沉重的家具，比如架子、书柜、冰箱。'],
      ['Keep heavy or fragile things on low shelves (under 1.5 m).', '把重的或易碎的东西放在低处（1.5 米以下）。'],
      ['Decide who turns off power, gas and water — and how.', '决定由谁关电、燃气和水，以及怎么关。']
    ],
    supplies: [
      ['q-protect', 'Sturdy shoes, gloves, goggles and a mask', '结实的鞋、手套、护目镜和口罩'],
      ['q-torch', 'Waterproof or wind-up torch', '防水或手摇手电筒'],
      ['q-whistle', 'Whistle to signal for help', '求救用的哨子'],
      ['q-docs', 'Copies of passport, ID and insurance in a waterproof carrier', '护照、证件和保险的复印件，放进防水袋']
    ],
    src: ['quakePrep', 'quake']
  }
};
var STR23 = {
  learnTitle: ['Learn about disasters', '了解灾害'],
  learnSub: ['What each disaster is, how to prepare, and what to add to your kit.', '每种灾害是什么、怎么提前准备、应急包里要加什么。'],
  learnWhat: ['What it is', '这是什么'], learnPrep: ['Prepare now', '提前准备'], learnSupplies: ['What you’ll need', '需要的物资'],
  learnAddAll: ['Add all to my kit', '全部加入我的应急包'], learnAdded: ['In your kit', '已在应急包里'],
  learnDuring: ['What to do when it happens', '发生时怎么做'],
  kitExtra: ['Added from Learn', '从“了解灾害”加入的'],
  tabLearn: ['Learn', '学习'], tabKit: ['Kit', '应急包'], tabGo: ['Directions', '指路'], tabProfile: ['Profile', '个人档案'],
  mvp: ['MVP mode', 'MVP 模式'], mvpSub: ['Show only the 4 core features: kit, learn, directions, profile.', '只显示 4 个核心功能：应急包、学习、指路、个人档案。'],
  emCardNote: ['Also fill in your phone’s own Medical ID — responders can open it from the lock screen.', '也请填写手机自带的“医疗急救卡”（Medical ID），救援人员在锁屏上就能打开。'],
  emCardWho: ['Your emergency card is for paramedics and helpers when you can’t speak for yourself — injured, in shock, or facing a language barrier.', '应急卡给救护人员和帮忙的人看：在你受伤、惊慌或语言不通、无法亲自说明时使用。']
};
for (var k23 in STR23) STR[k23] = STR23[k23];
DEWS_VERSION = '2.3.0';
STR.desktopLabel = ['Desktop', '电脑版']; STR.mobileLabel = ['Mobile', '手机版'];
STR.mobileLink = ['Mobile version', '手机版']; STR.desktopLink = ['Desktop version', '电脑版'];
DEWS_VERSION = '2.4.0';

/* v2.4.1 — onboarding swipe + step announcement */
STR.obStep = ['Step {n} of {total}', '第 {n} 步，共 {total} 步'];

/* v2.5 — Nearby redesign, location fallbacks, bundled places */
var STR25 = {
  locMe: ['Find my location', '定位我的位置'],
  locPick: ['Set my location on the map', '在地图上标出我的位置'],
  locPickHint: ['Tap the map where you are', '在地图上点你所在的位置'],
  locOn: ['Location on', '已定位'],
  locManual: ['Location set by you', '位置由你手动标出'],
  locTryWifi: ['Trying Wi-Fi location…', '正在尝试用 Wi-Fi 定位…'],
  locOff: ['Location is off', '定位已关闭'],
  locFail: ['Can’t find your location', '无法获取你的位置'],
  locNotYet: ['Location not on yet', '还没有开启定位'],
  locFailWhy: ['Your device couldn’t find its location. Go outside or near a window and try again. A Wi-Fi-only tablet or a computer has no GPS, so it needs Wi-Fi turned on — or set your location on the map.', '设备没能找到位置。请到室外或靠近窗户后重试。只有 Wi-Fi 的平板和电脑没有 GPS，需要打开 Wi-Fi；也可以直接在地图上标出你的位置。'],
  locRetry: ['Try again', '重试'],
  nearestSafe: ['Nearest help point', '最近的求助地点'],
  selected: ['Selected', '已选择'],
  hasED: ['emergency department', '有急诊'],
  needLocForRoute: ['Turn on location, or set it on the map, to get directions.', '开启定位或在地图上标出位置后，才能为你指路。'],
  routeOk: ['walking route', '步行路线'],
  routeLoading: ['finding a walking route…', '正在规划步行路线…'],
  routeOffline: ['offline — straight-line direction', '离线：显示直线方向'],
  routeFailed: ['route service didn’t answer — straight-line direction', '路线服务没有响应：显示直线方向'],
  openApple: ['Open in Apple Maps', '在 Apple 地图中打开'],
  openGoogle: ['Open in Google Maps', '在 Google 地图中打开'],
  nspNote: ['A Neighbourhood Safer Place is a last resort in a bushfire, when your plan has failed. It may not have food, shelter or staff.', '邻里避险点是山火时计划失败后的最后选择，那里可能没有食物、住宿或工作人员。'],
  srcPack: ['Places saved in the app from OpenStreetMap (community data), so they work offline.', '地点来自 OpenStreetMap（社区数据），已存进应用，离线也能用。'],
  updated: ['Updated', '更新于'],
  glassFrost: ['Frosted', '磨砂'], glassLiquid: ['Liquid', '液态'], glassTint: ['Tinted', '着色'], glassSolid: ['Solid', '不透明'],
  glassNote: ['Emergency and Call 000 buttons always stay solid, so they are easy to see.', '“紧急”和“拨打 000”按钮始终保持不透明，确保一眼能看到。'],
  tabletLabel: ['Tablet', '平板版'], tabletLink: ['Tablet version', '平板版']
};
for (var k25 in STR25) STR[k25] = STR25[k25];
STR.palC = ['Colour-vision friendly', '色觉友好'];
/* v2.6 */
var STR26 = {
  youAreHere: ['You are here', '你在这里'],
  glassAmount: ['Glass transparency', '玻璃透明度'], glassClear: ['More see-through', '更透明'], glassThick: ['More solid', '更实'],
  locDeniedHelp: ['Location was blocked. Check three things: 1) the device’s Location switch is on; 2) Settings → Apps → your browser → Permissions → Location is allowed; 3) this website is allowed to use location in the browser. Still not working? Open DEWS in Chrome, or set your location on the map.', '定位被阻止了。请检查三处：① 设备的“位置信息”总开关已打开；② 系统设置 → 应用 → 你的浏览器 → 权限 → 位置信息：允许；③ 浏览器里允许本网站使用位置。仍然不行，可以换 Chrome 打开 DEWS，或直接在地图上标出你的位置。'],
  locErrCode: ['Error details', '错误详情'],
  evacNote: ['Evacuation centres are opened by emergency services during an event. Check Hazards Near Me or listen to ABC Radio for where they are.', '疏散中心由应急部门在灾害发生时开放。请查看 Hazards Near Me 或收听 ABC 电台了解位置。'],
  browseNote: ['Showing real places near the map centre. Turn on location to see distances.', '显示的是地图中心附近的真实地点。开启定位后才能显示距离。']
};
STR26.tutReplay = ['Show me how this works', '看看怎么用'];
STR26.tut1 = ['Pick a disaster to learn about. Each one shows what it is, how to prepare and what to add to your kit.', '选一种灾害来了解。每种都会告诉你：它是什么、怎么提前准备、应急包里要加什么。'];
STR26.tut2 = ['Start here: what this disaster is, in plain words.', '先看这里：用简单的话说明这种灾害是什么。'];
STR26.tut3 = ['Things to do now, before it happens. Every step comes from an official Australian source.', '灾害来之前，现在就能做的事。每一条都来自澳洲官方来源。'];
STR26.tut4 = ['Supplies this disaster needs. Tick what you already have.', '这种灾害需要的物资。已经有的就打勾。'];
STR26.tut5 = ['Add everything to your emergency kit with one tap, then pack it in the kit checklist.', '一键全部加入你的应急包，再到应急包清单里逐项备好。'];
STR26.tut6 = ['If it is happening now, tap here for step-by-step help.', '如果灾害正在发生，点这里看分步指引。'];
STR26.tutTap = ['Tap anywhere to continue', '点击屏幕任意处继续'];
STR26.tutDone = ['Tap anywhere to finish', '点击屏幕任意处结束'];
STR26.tutSkip = ['Skip', '跳过'];
/* Sample warnings — one per kind of response. Wording follows the Australian Warning System
   calls to action (source: aws). Positions are placed relative to the person, for testing. */
var SAMPLE_ALERTS = [
  { hazard: 'storm', level: 'advice', kind: 'none', dx: -2600, dy: -1800, r: 1500,
    what: ['Severe thunderstorms are possible later today.', '今天稍晚可能有强雷暴。'],
    action: ['Stay informed', '随时关注最新消息'], area: ['Sample area (demo)', '示例区域（演示）'], issued: '14:20' },
  { hazard: 'flood', level: 'watch', kind: 'prepare', dx: 1400, dy: 900, r: 900,
    what: ['The creek is rising. Low-lying streets may flood tonight.', '河水正在上涨，低洼街道今晚可能被淹。'],
    action: ['Prepare to leave', '做好撤离准备'], area: ['Sample creek (demo)', '示例河道（演示）'], issued: '15:40' },
  { hazard: 'fire', level: 'emergency', kind: 'evacuate', dx: -1200, dy: -1500, r: 800,
    what: ['A bushfire is spreading towards homes.', '山火正在向住宅区蔓延。'],
    action: ['Leave now', '立即撤离'], area: ['Sample Ridge (demo)', '示例山区（演示）'], issued: '16:05' },
  { hazard: 'storm', level: 'emergency', kind: 'shelter', dx: 300, dy: -400, r: 2500,
    what: ['A destructive storm is about to hit your area.', '破坏性风暴即将到达你所在的区域。'],
    action: ['Shelter indoors now', '立即在室内避险'], area: ['Your area (demo)', '你所在的区域（演示）'], issued: '16:30' }
];
STR26.simTitle = ['Simulate a warning', '模拟一条预警'];
STR26.simSub = ['Pick a sample to test the flow. Nothing real is happening.', '选一条示例预警来测试流程。不是真实事件。'];
STR26.kindNone = ['Reminder only', '只是提醒'];
STR26.kindPrepare = ['Get ready to leave', '准备撤离'];
STR26.kindEvacuate = ['Leave now', '立即撤离'];
STR26.kindShelter = ['Shelter where you are', '就地避险'];
STR26.qWhat = ['What’s happening', '发生了什么'];
STR26.qFar = ['How far from you', '离你多远'];
STR26.qDo = ['What you need to do', '你需要做什么'];
STR26.qBring = ['Take these', '带上这些'];
STR26.qGo = ['Where to go', '去哪里'];
STR26.farIn = ['You are inside the warning area', '你就在预警区域内'];
STR26.farAway = ['to the edge of the warning area · it is to your', '到预警区域边缘的距离 · 位于你的'];
STR26.farDirSuffix = ['', '方'];
STR26.farNeedLoc = ['Turn on location to see how far it is.', '开启定位后，才能算出离你多远。'];
STR26.noAction = ['You don’t need to act now. Keep an eye on updates.', '现在不需要行动，留意后续更新即可。'];
STR26.gotIt = ['Got it', '知道了'];
STR26.prepareNow = ['Pack now so you can leave quickly if this gets worse.', '现在就收拾好，情况变坏时可以马上离开。'];
STR26.bringNow = ['Don’t stop to pack. Take only:', '不要停下来收拾，只带：'];
STR26.bring1 = ['Your emergency kit, if it’s by the door', '应急包（如果就在门口）'];
STR26.bring2 = ['Medication', '药品'];
STR26.bring3 = ['Important documents, phone and charger', '重要证件、手机和充电器'];
STR26.openKit = ['Open my emergency kit', '打开我的应急包'];
STR26.navGo = ['Start directions away from danger', '开始导航，远离危险区域'];
STR26.navPreview = ['Check your way out now', '先看好撤离路线'];
STR26.awayNote = ['The route leads away from the warning area.', '路线会避开预警区域的方向。'];
STR26.shelterSteps = ['How to shelter', '怎么避险'];
STR26.receivedWarning = ['A warning for your area', '你所在区域有一条预警'];
STR26.seeWhatToDo = ['See what to do', '看看该怎么做'];
STR26.hazardZone = ['Warning area', '预警区域'];
STR26.fbTitle = ['Feedback', '反馈与建议'];
STR26.fbSub = ['Something not working, or an idea? Tell us — every report is read and answered.', '有功能不能用，或者有想法？告诉我们，每条都会看并回复。'];
STR26.fbProblem = ['Report a problem', '报告问题'];
STR26.fbIdea = ['Suggest an idea', '提建议'];
STR26.fbPrivacy = ['Opens a public page on GitHub (free account needed). Your app version and device type are filled in; never your profile, location or health details.', '会打开 GitHub 上的公开页面（需要免费账号）。会自动填写 app 版本和设备类型，绝不会附上你的档案、位置或健康信息。'];
STR26.fbReportThis = ['Report this problem', '报告这个问题'];
for (var k26 in STR26) STR[k26] = STR26[k26];
STR.paletteNote = ['C is designed so people with colour blindness (difficulty telling some colours apart, about 1 in 12 men) can still tell every colour apart.', 'C 方案专为色盲、色弱的人设计（分不清某些颜色，约每 12 名男性中有 1 人），所有颜色仍能区分开。'];
/* 2.8.0 — real NSW bushfire warnings (NSW RFS feed). Chinese for fixed terms is in warnings.js (ZH). */
var STR28 = {
  practice: ['Practice', '练习'],
  demoAlert: ['Practice mode: try a sample warning', '练习模式：试一条示例预警'],
  demoAlertSub: ['See how DEWS guides you. Nothing real is happening.', '看看 DEWS 会怎样引导你，不是真实事件。'],
  practiceEnd: ['End practice', '结束练习'],
  liveFrom: ['NSW Rural Fire Service', '新州乡村消防局（NSW RFS）'],
  liveChecked: ['checked', '检查于'],
  agoNow: ['just now', '刚刚'],
  liveRfsUpdated: ['RFS updated', 'RFS 更新于'],
  liveLoading: ['Checking NSW bushfire warnings…', '正在检查新州山火警告…'],
  liveNoData: ['Couldn’t load bushfire warnings', '无法载入山火警告'],
  liveError: ['Couldn’t reach NSW RFS. Warnings may be missing.', '连不上 NSW RFS，可能漏掉警告。'],
  liveOffline: ['You’re offline. These warnings may be out of date.', '你现在离线，这些警告可能已经过时。'],
  liveStale: ['Not updated for over an hour. These warnings may be out of date.', '超过一小时没有更新，这些警告可能已经过时。'],
  liveOpenFnm: ['Check Fires Near Me', '查看 Fires Near Me'],
  liveNone: ['No bushfire warnings within 50 km', '50 公里内没有山火警告'],
  liveNoneState: ['No Emergency Warnings for bushfires in NSW', '新州目前没有山火紧急警告'],
  liveNeedLoc: ['Turn on location to see every fire within 50 km. Without it, DEWS shows only Emergency Warnings across NSW.', '开启定位才能看到 50 公里内的所有火情。没有定位时，只显示全新州的紧急警告。'],
  liveScope: ['Bushfires in NSW only, from NSW RFS. Floods, storms and other hazards are not connected yet.', '目前只有新州山火，来自 NSW RFS。洪水、风暴等其他灾害还没有接入。'],
  liveAll: ['See all', '查看全部'],
  liveAllTitle: ['Fires near you', '你附近的火情'],
  liveApprox: ['approx.', '大约'],
  liveGone: ['This incident is no longer listed', '这个事件已不在列表中'],
  liveGoneSub: ['NSW RFS has removed it or it has ended. Check Fires Near Me for the latest.', 'NSW RFS 已移除或事件已结束。请到 Fires Near Me 查看最新情况。'],
  liveWhere: ['Where', '地点'],
  liveSize: ['Size', '面积'],
  liveAgency: ['Agency', '负责机构'],
  liveUnmapped: ['Exact location not mapped yet. It is shown at the centre of the council area, so the distance is rough.', '准确位置还没有标出，暂时显示在所在地方政府区域的中心，所以距离只是粗略估计。'],
  liveEnglishNote: ['Place names are kept in English, as on official signs and radio.', '地名保留英文，和官方路牌、电台一致。'],
  liveToPoint: ['to the reported location (fire area not mapped)', '到报告位置的距离（火场范围未标出）'],
  liveActionNote: ['The official warning says exactly what to do (for example, leave now or shelter). DEWS doesn’t have that message, so read it on Fires Near Me. If your life is in danger, call 000.', '官方警告会写明具体该怎么做（例如立即离开或就地避险）。DEWS 拿不到这段原文，请到 Fires Near Me 阅读。如有生命危险，拨打 000。'],
  liveReadOfficial: ['Read the official warning', '阅读官方警告'],
  liveFireSteps: ['Bushfire steps: can you leave safely?', '山火指引：你能安全离开吗？'],
  liveNoLevel: ['No warning level has been issued for this incident.', '这个事件没有发布警告级别。'],
  liveFarAway: ['This warning is far from you. It is shown because it is the highest level in NSW.', '这条警告离你很远。因为是新州最高级别的警告，所以也显示出来。'],
  liveNearYou: ['A bushfire warning near you', '你附近有山火警告']
};
for (var k28 in STR28) STR[k28] = STR28[k28];
SOURCES.rfs = { t: 'NSW RFS — Fires Near Me (live incidents feed, CC BY 4.0)', u: 'https://www.rfs.nsw.gov.au/fire-information/fires-near-me' };
/* Screen tours — the ? icon on every screen. Each step: [element to light up, English, 中文].
   Steps whose element isn't on screen right now are skipped. Wording matches the real button labels. */
var TOURS = {
  home: [
    ['#main .alert', 'Real bushfire warnings from NSW RFS: every fire within 50 km of you, and every Emergency Warning in NSW. Tap a card to see what it means for you.', 'NSW RFS 的真实山火警告：你 50 公里内的所有火情，以及全新州的紧急警告。点卡片看它对你意味着什么。'],
    ['#main .meter', 'The level: yellow Advice, orange Watch and Act, red Emergency Warning.', '警告级别：黄色「建议」、橙色「注意并行动」、红色「紧急警告」。'],
    ['.live-list', 'Other fires near you, highest level first.', '你附近的其他火情，级别高的排在前面。'],
    ['.live-src', 'When DEWS last checked. If you’re offline or it’s over an hour old, a note appears here.', 'DEWS 最近一次检查的时间。离线或超过一小时没更新时，这里会出现提示。'],
    ['.practice-link', 'Practice mode: try a sample warning safely. Nothing real happens.', '练习模式：安全地试一条示例预警，不会发生真实的事。'],
    ['.em-entry', 'In danger now? Tap here for step-by-step help.', '现在有危险？点这里看分步指引。'],
    ['[data-tut="ready"]', 'How prepared you are. Tap “Next step” to keep going.', '你准备得怎么样。点「下一步」继续完成。'],
    ['.num.red', 'Life-threatening emergency: call 000. Flood or storm help: 132 500.', '有生命危险：拨打 000。洪水、风暴求助：132 500。'],
    ['.sosbtn', 'Emergency mode, from any screen.', '在任何页面都能进入紧急模式。'],
    ['.tabs, .side-nav', 'Move between Today, Prepare, Nearby and Profile.', '在「今天」「准备」「附近」「个人档案」之间切换。']
  ],
  live: [
    ['#main .alert', 'The official warning level from NSW RFS and the fire’s name.', 'NSW RFS 发布的官方警告级别和火情名称。'],
    ['.em-quick', 'Life in danger? Call 000.', '有生命危险？拨打 000。'],
    ['[data-tut="wf1"]', 'What’s happening: fire type, whether firefighters have it under control, where, and when RFS last updated it. Place names stay in English, as on signs and radio.', '发生了什么：火的类型、是否已控制、地点、RFS 最近更新时间。地名保留英文，和路牌、电台一致。'],
    ['[data-tut="wf2"]', 'How far it is from you, and in which direction.', '离你多远，在哪个方向。'],
    ['[data-tut="wf3"]', 'What this level means. Tap “Read the official warning” for the exact action RFS has given for this fire.', '这个级别的意思。点「阅读官方警告」看 RFS 对这场火给出的具体行动。'],
    ['[data-tut="wf4"]', 'The nearest help point, with a route away from the fire. Never walk towards fire or smoke.', '最近的求助地点，路线会避开火场。不要朝火或烟的方向走。'],
    ['.live-src', 'Source and when DEWS last checked.', '信息来源和 DEWS 最近检查的时间。']
  ],
  fires: [
    ['.live-list', 'Every fire DEWS is showing: highest level first, then nearest.', 'DEWS 正在显示的所有火情：先按级别，再按距离排列。'],
    ['.live-row.lv-none', 'Grey dot: no warning level, for example a planned burn by firefighters. There may be smoke, but it is not a disaster.', '灰色圆点：未分级，例如消防部门的计划性焚烧。可能有烟，但不是灾害。'],
    ['.live-src', 'When DEWS last checked NSW RFS.', 'DEWS 最近检查 NSW RFS 的时间。']
  ],
  practice: [
    ['#main .alert', 'A sample warning marked “Practice”. Nothing real is happening.', '标着「练习」的示例预警，不是真实事件。'],
    ['[data-tut="wf1"]', 'Go through the steps from top to bottom.', '从上往下一步步看。'],
    ['[data-tut="wf3"]', 'What you need to do now.', '现在你需要做什么。'],
    ['[data-tut="wf5"]', 'Where to go, with a route away from the warning area.', '去哪里，路线会避开预警区域。']
  ],
  sos: [
    ['.em-actions .emb.red', 'Life in danger? Call 000 first.', '有生命危险？先拨打 000。'],
    ['.guide', 'The arrow points to the nearest help point. Tap it for a full-screen map.', '箭头指向最近的求助地点。点它打开全屏地图。'],
    ['.em-two', '“Tell family I’m safe” sends them a text. “Request help” is a demo for now.', '「给家人报平安」会给家人发短信；「请求救援」目前是演示。'],
    ['[data-tut="hz"]', 'Pick what’s happening for step-by-step help.', '选择正在发生的灾害，看分步指引。'],
    ['.tools', 'Torch, SOS flashing light, whistle, and a card to show responders.', '手电筒、SOS 闪光、口哨，以及给救援人员看的卡片。'],
    ['.top .iconbtn', 'Tap “Exit” to leave emergency mode.', '点「退出」离开紧急模式。']
  ],
  fork: [
    ['.fork-q', 'Answer this one question.', '回答这一个问题。'],
    ['.fork', 'Tap the answer that fits you right now. The label shows what follows: leave, or shelter where you are.', '点最符合你现在情况的选项。标签说明接下来是离开，还是就地避险。']
  ],
  steps: [
    ['.now', 'The most important step. Do it first.', '最重要的一步，先做这件。'],
    ['.steps', 'Then work down the numbered steps.', '然后按编号往下做。'],
    ['#main .textlink', 'Wrong choice? Choose again here.', '选错了？在这里重新选择。'],
    ['.dock', 'Call 000 stays here at the bottom.', '拨打 000 一直在底部。']
  ],
  helpreq: [
    ['.callout.demo', 'This is a demo: requests don’t reach a real agency yet. In danger, call 000.', '这是演示：请求还不会发给真实机构。有危险请拨打 000。'],
    ['.seg-ctl.danger', 'How badly is anyone hurt? “Serious injury” shows a 000 button straight away.', '有人受伤吗？选「重伤」会立刻出现 000 按钮。'],
    ['#main .stepper', 'How many people are with you.', '你身边有几个人。'],
    ['#main .chips', 'Tap what you need.', '点选你需要的东西。'],
    ['[data-a="hrToggle"]', 'Choose whether to share your location and your emergency card.', '选择是否分享你的位置和应急卡。'],
    ['.dock', 'Send the request.', '发送请求。']
  ],
  sent: [
    ['.eta', 'The arrival time is a sample.', '预计到达时间只是示例。'],
    ['#main .kv', 'What was sent.', '发送了哪些内容。'],
    ['[data-a="hrSms"]', 'Also send the same details by text message.', '同时用短信发送相同的内容。']
  ],
  go: [
    ['.go-panel', 'Which way to walk, how far and how long. Follow roads and paths.', '往哪个方向走、多远、多久。沿着道路和小路走。'],
    ['.go-panel .chips', 'Tap another place to go there instead.', '点别的地点可以换目的地。'],
    ['.go-side', 'Centre the map on you, or turn it with your direction.', '让地图回到你的位置，或跟着你的朝向转动。'],
    ['.go-top .iconbtn', 'Back.', '返回。']
  ],
  prepare: [
    ['a.prep-card:nth-of-type(1)', 'Start here: your emergency kit. The bar shows your progress.', '从这里开始：应急包。进度条显示完成了多少。'],
    ['a.prep-card:nth-of-type(2)', 'Learn each disaster and what to add to your kit.', '了解每种灾害，以及应急包里要加什么。'],
    ['a.prep-card:nth-of-type(3)', 'Make a plan with the people you live with.', '和一起住的人制定计划。'],
    ['a.prep-card:nth-of-type(4)', 'Test yourself with a short quiz.', '用小测验检验一下自己。']
  ],
  kit: [
    ['.calc', 'How many people the kit is for.', '应急包是给几个人准备的。'],
    ['[data-a="kitToggle"]', 'Turn on Baby or Pets if you need them.', '有婴儿或宠物就打开对应开关。'],
    ['.water', 'Drinking water you need. It updates with the number of people.', '需要的饮用水，会随人数自动更新。'],
    ['#main .check', 'Tick each item when it’s packed.', '每备好一样就打勾。']
  ],
  plan: [
    ['.person', 'Everyone you live with, and their phone numbers.', '一起住的每个人和他们的电话。'],
    ['[data-a="planAdd"]', 'Add another person.', '再添加一个人。'],
    ['[data-bind="plan.near"]', 'A meeting point near home, and one outside your suburb in case your area is closed.', '家附近的集合点，以及区外的集合点，以防你所在区域被封锁。'],
    ['[data-bind="plan.contact"]', 'Someone outside the area everyone can call.', '大家都能联系的外地联系人。'],
    ['[data-bind="plan.trigger"]', 'What will make you leave.', '出现什么情况时你们就离开。'],
    ['[data-a="planShare"]', 'Send the plan to everyone. It’s saved on this phone only.', '把计划发给所有人。计划只保存在这部手机上。']
  ],
  quiz: [
    ['[data-a="quizStart"]', 'Start the quiz. After each answer you’ll see why, and the official source.', '开始测验。每答一题都会看到原因和官方来源。'],
    ['.qprog', 'Your progress.', '你的进度。']
  ],
  map: [
    ['#mapWrap', 'Real places from OpenStreetMap: hospitals, police, fire stations, water, charging points.', 'OpenStreetMap 上的真实地点：医院、警察局、消防站、饮用水、充电点。'],
    ['.map-chip', 'Whether your location is on.', '你的定位是否开启。'],
    ['[data-a="pickMe"]', 'Location not working? Tap here, then tap where you are on the map.', '定位不了？点这里，再在地图上点你所在的地方。'],
    ['.filters', 'Show one type of place.', '只显示某一类地点。'],
    ['.place-list', 'Tap a place to see distance and directions.', '点一个地点查看距离和路线。']
  ],
  me: [
    ['.idcard', 'Your emergency card, in English so responders can read it. Tap to edit.', '你的应急卡，用英文方便救援人员阅读。点它编辑。'],
    ['[data-a="mvpToggle"]', 'MVP mode: a simpler app with four parts.', 'MVP 模式：只有四个部分的简化版。'],
    ['#main section.card', 'Language, text size, light or dark, colours and glass style.', '语言、字体大小、浅色或深色、配色和玻璃效果。'],
    ['a[href*="issues/new"]', 'Report a problem or share an idea.', '报告问题或提建议。'],
    ['[data-a="reset"]', 'Delete everything saved on this phone.', '删除这部手机上保存的所有内容。']
  ],
  card: [
    ['#main .callout', 'Everything stays on this phone.', '所有内容只保存在这部手机上。'],
    ['[data-bind="card.lang"]', 'Fill in what helps responders. Write in English if you can.', '填写对救援人员有用的信息，尽量用英文。'],
    ['[data-bind="card.allergies"]', 'Allergies and medication.', '过敏和用药。'],
    ['[data-bind="card.contactPhone"]', 'Someone responders can call.', '救援人员可以联系的人。']
  ],
  sources: [
    ['.src-list', 'Every safety step in DEWS comes from one of these official sources. Tap one to read the original.', 'DEWS 的每一条安全指引都来自这些官方来源。点开可以看原文。']
  ]
};
STR.helpBtn = ['How to use this screen', '这个页面怎么用'];
DEWS_VERSION = '2.8.0';
