export const COURSE_VERSION = 'digital-cultivation-2';

export const CHAPTERS = [
    {id: 'prologue', title: '序章·飛昇大典', seal: '入門道印'},
    {id: 'evolution', title: '第一章·上古機關城', seal: '演進道印'},
    {id: 'architecture', title: '第二章·五府經脈', seal: '架構道印'},
    {id: 'memory', title: '第三章·藏經閣塞車', seal: '記憶道印'},
    {id: 'os', title: '第四章·總管調度令', seal: '調度道印'},
    {id: 'accelerator', title: '第五章·金丹萬劍陣', seal: '平行道印'},
    {id: 'network', title: '第六章·洞天斷訊', seal: '雲海道印'},
    {id: 'ai', title: '第七章·天機黑箱', seal: '求真道印'},
    {id: 'final', title: '終章·結案', seal: '真相道印'}
];

// A tiny stored-program computer: memory cells hold instructions or numbers, the CPU runs them one cell at a time.
export const OPS = {load: '讀取', add: '加上', sub: '減去', mul: '乘以', show: '顯示結果', halt: '停止'};
const MATH = {add: '＋', sub: '－', mul: '×'};
export const cellLabel = cell => {
    if (!cell) return '（空）';
    if (cell[0] === 'num') return `數字 ${cell[1]}`;
    return cell.length > 1 ? `${OPS[cell[0]]} 第 ${cell[1]} 格` : OPS[cell[0]];
};
export const applyEdits = (machine, edits = {}) => machine.memory.map((cell, index) => {
    const op = edits[index];
    if (!op || !machine.edit?.[index]) return cell;
    const address = cell && cell[0] !== 'num' && cell.length > 1 ? cell[1] : machine.operand?.[index];
    return ['load', 'add', 'sub', 'mul'].includes(op) ? [op, address] : [op];
});
export function runMachine (memory, limit = 40) {
    const trace = [];
    const output = [];
    let pc = 0;
    let acc = null;
    const log = (unit, text) => trace.push({pc, unit, text, acc, output: [...output]});
    for (let count = 0; count < limit; count += 1) {
        const cell = memory[pc];
        if (!cell || cell[0] === 'halt') {
            log('control', `控制單元讀到第 ${pc} 格「${cellLabel(cell)}」，程式結束。`);
            return {trace, output, acc};
        }
        if (cell[0] === 'num') {
            log('control', `第 ${pc} 格放的是數字 ${cell[1]}，不是指令，CPU 停了下來。`);
            return {trace, output, acc, error: 'DATA_AS_CODE'};
        }
        log('control', `控制單元從第 ${pc} 格讀出指令「${cellLabel(cell)}」。`);
        const [op, address] = cell;
        const value = memory[address]?.[0] === 'num' ? memory[address][1] : null;
        if (op in MATH || op === 'load') {
            if (value === null) {
                log('control', `第 ${address} 格沒有數字，這個指令無法執行。`);
                return {trace, output, acc, error: 'NO_NUMBER'};
            }
            if (op === 'load') {
                acc = value;
                log('control', `控制單元把第 ${address} 格的數字 ${value} 放進 CPU。`);
            } else {
                const before = acc ?? 0;
                acc = op === 'add' ? before + value : op === 'sub' ? before - value : before * value;
                log('alu', `算術邏輯單元計算 ${before} ${MATH[op]} ${value} ＝ ${acc}。`);
            }
        } else if (op === 'show') {
            output.push(acc);
            log('output', `螢幕顯示 ${acc ?? '（空）'}。`);
        }
        pc += 1;
    }
    log('control', '執行太多步，先停下來。');
    return {trace, output, acc, error: 'TOO_LONG'};
}

export const DEFAULT_BINS = [['cpu', 'CPU'], ['gpu', 'GPU']];

const story = (chapter, id, title, narrative, truth, metaphor) => ({
    chapter, id, type: 'story', title, narrative, truth, metaphor, points: 0
});
const task = (chapter, id, type, title, prompt, choices, answer, points, hints, extra = {}) => ({
    chapter, id, type, title, prompt, choices, answer, points, hints, ...extra
});
const seal = (chapter, id, learned, extra = {}) => ({chapter, id, type: 'seal', title: CHAPTERS[chapter].seal, learned, points: 0, ...extra});

const ADD_PROGRAM = [['load', 6], ['add', 7], ['show'], ['halt'], null, null, ['num', 8], ['num', 3]];

export const STEPS = [
    story(0, 'arrival', '天機鏡的錯誤預言',
        '飛昇大典前夕，天機鏡忽發預言：「明日天機城必將毀滅。」語畢，全城螢幕盡暗。眾人皆言 AI 失控；你卻在機房門口拾得一張紙條，上書：「先查系統，再談神通。」',
        '資訊系統由硬體、軟體、資料與網路一起運作；AI 也要在真實的電腦系統上執行。',
        '修士施展神通，靠的是經脈、靈氣與法器；AI 要發揮作用，也需要完整的系統平臺。'),
    task(0, 'platform-scope', 'choice', '換芯之議',
        '長老說：「換一顆最強的 CPU，天機鏡就會恢復。」這個說法最大的問題是什麼？',
        [
            ['system', '天機鏡靠整個系統運作，問題不一定出在 CPU'],
            ['price', '最強的 CPU 太貴，天機城買不起'],
            ['gpu', '應該換最強的 GPU，不是 CPU'],
            ['none', '沒有問題，CPU 就等於整台電腦']
        ], 'system', 3, ['天機鏡除了 CPU，還要靠哪些東西才能運作？']),
    task(0, 'platform-layers', 'order', '留影術',
        '天機鏡要拍下城門。這道拍照指令從發出到完成，依序經過哪三層？請由第 1 層排到第 3 層。',
        [
            ['app', '預言程式（應用程式）發出「拍照」指令'],
            ['os', '作業系統接收指令，調度鏡頭與處理器'],
            ['hardware', '鏡頭與處理器（硬體）實際拍下影像']
        ], ['app', 'os', 'hardware'], 3, ['應用程式不能直接指揮硬體，中間要經過哪一層？']),
    seal(0, 'seal-entry', ['系統平臺不等於單一零件', 'AI 仍受硬體、軟體與網路限制']),

    story(1, 'archive', '歷代法器年表',
        '檔案室藏有四幅影像：巨型機房、案頭電腦、掌中小鏡、雲端洞天。長老曰：「此非新舊相代，乃各應其時、各適其用。」',
        '系統平臺從集中式大型電腦，發展出個人電腦、行動裝置、雲端與邊緣運算等形式。',
        '洞府變小、宗門變大；運算可以在手上，也可以在遠方的資料中心。'),
    task(1, 'evolution-order', 'order', '排回時間軸',
        '依照大致普及的年代，把四種平臺由早到晚排列。',
        [
            ['mainframe', '大型電腦：佔滿整個房間，許多人透過終端機輪流使用'],
            ['pc', '個人電腦：放在桌上，一人一台'],
            ['mobile', '智慧型手機：放進口袋，隨時連網'],
            ['cloud', '大規模雲端服務：資料和運算放在遠方，隨處取用']
        ], ['mainframe', 'pc', 'mobile', 'cloud'], 3,
        ['電腦越早期越大、越多人共用。', '人人有了手機之後，雲端服務才大規模進入日常。']),
    task(1, 'stored-program', 'program', '換程式不換電腦',
        '天機鏡要改算「8 − 3」，但不准更換任何硬體。請修改記憶體裡的指令，執行後讓螢幕顯示 5，再按「送出結果」。',
        [], {1: 'sub', 2: 'show'}, 4, ['CPU 做什麼，是看記憶體裡的指令。', '試試把第 1 格的「加上」換成別的運算。'],
        {machine: {memory: ADD_PROGRAM, edit: {1: ['add', 'sub', 'mul', 'load'], 2: ['show', 'halt']}, goal: [5]}}),
    task(1, 'mobile-platform', 'choice', '隨身洞府',
        '在個人電腦普及以前的大型電腦時代，一般人要用電腦，通常怎麼做？',
        [
            ['terminal', '到有終端機的地方，和許多人輪流使用同一台電腦'],
            ['pocket', '從口袋拿出自己的手機，隨時連網使用'],
            ['desk', '在家裡用自己桌上的個人電腦'],
            ['cloud', '用手機把工作交給遠方的雲端處理']
        ], 'terminal', 3, ['個人電腦出現以前，一台電腦又大又貴。', '很多人要共用同一台，該怎麼用？']),
    seal(1, 'seal-evolution', ['平臺會演進，但舊形式不一定消失', '儲存程式：換記憶體裡的程式，同一台電腦就能做不同工作']),

    story(2, 'meridians', '資料流向失蹤',
        '你按下鍵盤，螢幕卻一片空白。字去了哪裡？須循輸入、記憶、處理、輸出諸經脈，逐站追查。',
        '電腦由輸入、輸出、記憶、控制、算術邏輯五大單元合作運作；控制單元和算術邏輯單元都在 CPU 裡。',
        '五府經脈不通，法術再強也無法顯現。'),
    task(2, 'data-path', 'path', '接回資料經脈',
        '你按下鍵盤上的「山」。依資料實際走的路線，依序點出它經過的站，直到螢幕顯示為止。同一站可以經過兩次。',
        [], ['keyboard', 'memory', 'cpu', 'memory', 'screen'], 4,
        ['資料要被處理，得先放在 CPU 拿得到的地方。', 'CPU 處理完，結果也要先放回記憶體，螢幕才拿得到。'],
        {nodes: [
            ['keyboard', '鍵盤', '輸入'], ['memory', '記憶體', 'RAM'], ['cpu', 'CPU', '控制＋算術邏輯'],
            ['screen', '螢幕', '輸出'], ['ssd', 'SSD', '長期儲存'], ['speaker', '喇叭', '輸出']
        ]}),
    task(2, 'cpu-parts', 'match', 'CPU 雙堂會審',
        '先按「執行一步」，看 CPU 裡哪一個單元亮起。再把下面每個動作，分給負責的單元。',
        [
            ['fetch', '從記憶體讀出下一個指令'],
            ['decode', '看懂指令要做什麼，並指揮其他單元'],
            ['add', '把 8 和 3 相加'],
            ['compare', '比較兩個數字哪個比較大'],
            ['next', '決定下一個要讀第幾格']
        ], {add: 'alu', compare: 'alu', decode: 'control', fetch: 'control', next: 'control'}, 4,
        ['跟「指令」有關的，是哪一堂的工作？', '算數字、比大小，是另一堂的工作。'],
        {bins: [['control', '控制單元'], ['alu', '算術邏輯單元']], machine: {memory: ADD_PROGRAM}}),
    task(2, 'io-devices', 'match', '誰在向系統說話',
        '把每個裝置分進合適的一欄：資料是送進電腦（輸入）、從電腦送出（輸出），還是兩種都有？',
        [
            ['keyboard', '鍵盤'], ['camera', '攝影機'], ['speaker', '喇叭'],
            ['printer', '印表機'], ['touchscreen', '觸控螢幕'], ['headset', '耳機麥克風']
        ], {camera: 'input', headset: 'both', keyboard: 'input', printer: 'output', speaker: 'output', touchscreen: 'both'}, 4,
        ['資料往哪個方向走？進電腦，還是出電腦？', '觸控螢幕：手指的位置送進去，畫面也送出來。'],
        {bins: [['input', '輸入'], ['output', '輸出'], ['both', '兩者都有']]}),
    seal(2, 'seal-architecture', ['資料要先進記憶體，CPU 才能處理', 'CPU 由控制單元和算術邏輯單元組成，但 CPU 不是整台電腦']),

    story(3, 'library-fire', '藏經閣為何越讀越慢',
        '天機鏡同時展開太多經卷，案頭已滿，只得往遠方庫房來回搬運。經卷俱在，速度卻一落千丈。',
        'RAM 放目前執行需要的資料，儲存裝置負責長期保存；不同層級在速度、容量與價格之間取捨。',
        '案頭近而小，庫房大而遠。'),
    task(3, 'ram-or-storage', 'choice', '經卷上案',
        '開啟遊戲時會出現「讀取中」。這段時間，電腦主要在做什麼？',
        [
            ['load', '把遊戲資料從 SSD 載入 RAM'],
            ['save', '把遊戲資料從 RAM 存回 SSD'],
            ['download', '從網路重新下載整個遊戲'],
            ['warmup', '讓 CPU 先熱機，速度才會變快']
        ], 'load', 3, ['「讀取」是從哪裡讀到哪裡？', '處理器要快速取用的資料，得先放在哪裡？']),
    task(3, 'power-loss', 'choice', '若靈石斷供',
        '假如此刻突然停電，重新開機後，哪一份資料最可能不見？',
        [
            ['ram', '剛打好、還沒按儲存的報告內容'],
            ['ssd', '上星期存進 SSD 的報告'],
            ['cloud', '昨天上傳到雲端硬碟的照片'],
            ['usb', '放在隨身碟裡的簡報']
        ], 'ram', 3, ['哪一種記憶體要一直有電，才能保留內容？']),
    task(3, 'memory-order', 'order', '藏經閣速度階梯',
        '將常見儲存層級排序：第 1 個放最接近 CPU、通常最快的一層，最後放離 CPU 最遠、最慢的一層。',
        [['register', '暫存器（在 CPU 裡）'], ['cache', '快取記憶體'], ['ram', 'RAM（主記憶體）'], ['storage', 'SSD／長期儲存']],
        ['register', 'cache', 'ram', 'storage'], 3, ['暫存器就在 CPU 裡，最貼近運算。', '快取介於暫存器和 RAM 之間。']),
    task(3, 'memory-bottleneck', 'choice', '災情判讀',
        '天機鏡的工作管理員顯示如上，程式卻非常慢。最可能的原因是什麼？',
        [
            ['memory', '記憶體不夠，資料一直在 RAM 和 SSD 之間搬'],
            ['cpu', 'CPU 太慢，應該換一顆更快的 CPU'],
            ['network', '網路太慢，資料傳不過來'],
            ['screen', '螢幕解析度太高，畫面來不及顯示']
        ], 'memory', 3, ['哪一格幾乎滿了？CPU 真的很忙嗎？'],
        {panel: [['CPU', 18], ['記憶體', 97], ['磁碟', 100], ['網路', 2]]}),
    seal(3, 'seal-memory', ['要用的資料得先載入 RAM；斷電時 RAM 會清空', '程式慢可能是在等資料，不一定是 CPU 太慢'],
        {pause: '第一節課到這裡。下一節從第四章接著查，你的進度已經存好了。'}),

    story(4, 'scheduler', '總管不是幫大家算題',
        '數十個程式同時爭搶 CPU、記憶體與裝置。城中有一總管，不替人做事，專管資源與秩序——此即作業系統。',
        '作業系統管理程式的執行、記憶體、檔案、裝置、使用者與權限，並讓應用程式能使用硬體。',
        '總管掌理法器、排班與門禁，但不代替弟子修練；應用程式就是城中的弟子。'),
    task(4, 'os-jobs', 'multi', '總管的職責',
        '選出所有屬於作業系統的常見工作。',
        [
            ['process', '管理執行中的程式'], ['memory', '分配記憶體給各個程式'], ['files', '管理檔案與資料夾'],
            ['devices', '協調印表機、喇叭等裝置'], ['layout', '把網頁的文字和圖片排版顯示'], ['formula', '計算試算表裡的公式']
        ], ['devices', 'files', 'memory', 'process'], 3, ['這件事是大家共用的資源，還是某個程式自己的內容？']),
    task(4, 'os-examples', 'multi', '總管名冊',
        '選出所有屬於作業系統的軟體。',
        [['windows', 'Windows'], ['android', 'Android'], ['ios', 'iOS'], ['linux', 'Linux'], ['browser', '網頁瀏覽器'], ['game', '手機遊戲']],
        ['android', 'ios', 'linux', 'windows'], 3, ['作業系統管理整台裝置；瀏覽器和遊戲是裝在作業系統上的應用程式。']),
    task(4, 'scheduling', 'choice', '輪流登壇',
        '只有一個核心的電腦，為什麼能一邊播音樂、一邊讓你打字？',
        [
            ['switch', '作業系統讓它們快速輪流使用 CPU'],
            ['own', '每個程式都有自己專用的 CPU'],
            ['pause', '你打字的時候，音樂其實暫停了'],
            ['nocpu', '播放音樂不需要用到 CPU']
        ], 'switch', 3, ['一個核心同一瞬間只能做一件事，但「一瞬間」有多短？']),
    task(4, 'permissions', 'choice', '門禁測試',
        '你剛下載一個手電筒 App，它要求讀取你的通訊錄和位置。最適當的做法是什麼？',
        [
            ['deny', '拒絕，手電筒用不到這些權限'],
            ['store', '允許，反正是從官方商店下載的'],
            ['later', '先全部允許，之後有空再關'],
            ['broken', '允許，不然 App 可能打不開']
        ], 'deny', 3, ['手電筒要做的事，需要知道你的朋友是誰、你在哪裡嗎？']),
    seal(4, 'seal-os', ['作業系統管理程式執行、記憶體、檔案、裝置與權限', '只給程式真正需要的權限']),

    story(5, 'golden-core', '萬劍齊發不等於萬事皆能',
        '長老欲將萬事盡交萬劍陣（GPU），卻見開機、逐步推演與複雜判斷，並未因此加快。',
        'CPU 擅長通用、低延遲與複雜的控制流程；GPU 擅長大量、可平行處理的相似運算。實際系統常由多種處理器合作。',
        'CPU 像臨場指揮，GPU 像同時結陣的大量弟子。'),
    task(5, 'workload-match', 'match', '法術分派',
        '為每項工作選擇最適合的主要處理器。',
        [
            ['boot', '作業系統開機與複雜判斷'],
            ['serial', '下一步要看上一步結果的計算'],
            ['pixels', '同時調亮一張照片的幾百萬個像素'],
            ['matrix', '訓練 AI 模型的大量矩陣運算'],
            ['face', '手機的臉部解鎖辨識']
        ], {boot: 'cpu', face: 'npu', matrix: 'gpu', pixels: 'gpu', serial: 'cpu'}, 4,
        ['「大量、相似、可以同時做」的工作交給誰？', 'NPU 是手機裡專門做 AI 辨識的處理器。'],
        {bins: [['cpu', 'CPU'], ['gpu', 'GPU'], ['npu', 'NPU']]}),
    task(5, 'gpu-truth', 'choice', '結丹真相',
        '下列哪一句對 GPU 的描述最準確？',
        [
            ['accelerator', '擅長大量平行運算，但仍受資料搬移限制'],
            ['replace', '已經完全取代 CPU，電腦不再需要 CPU'],
            ['magic', '任何程式放到 GPU 上執行都一定變快'],
            ['graphics', '只能用來顯示畫面，不能做其他計算']
        ], 'accelerator', 3, ['GPU 擅長哪一種工作？它能不能不等資料就開始算？']),
    task(5, 'multicore', 'choice', '八道分身',
        '一個只能「一步接一步」計算的程式，從 1 核心的電腦換到 8 核心的電腦（每個核心速度一樣），大約會快幾倍？',
        [['same', '差不多一樣快'], ['eight', '快 8 倍'], ['four', '快 4 倍'], ['two', '快 2 倍']],
        'same', 3, ['這個程式的每一步，都要等上一步算完。', '其他七個核心幫得上忙嗎？']),
    seal(5, 'seal-accelerator', ['CPU、GPU、NPU 各有擅長的工作', '多核心和 GPU 都不能讓所有工作自動變快']),

    story(6, 'broken-link', '洞府沒壞，仙界卻聯絡不上',
        '洞府之內，諸事如常；雲端模型、書信與網頁卻音訊全無。線索直指一條斷了的傳送之路。',
        '裝置要透過區域網路、路由器與網際網路，才能連到遠端服務；本地、邊緣與雲端運算各有取捨。',
        '洞府是本地裝置，仙界宗門像遠端的資料中心；傳送陣一斷，雲端神通就到不了。'),
    task(6, 'network-path', 'order', '修復傳送陣',
        '把教室平板連到遠端網路服務的路徑，由第 1 站排到第 5 站。',
        [['device', '教室平板'], ['lan', '教室的 Wi-Fi（區域網路）'], ['router', '路由器／閘道器'], ['internet', '網際網路'], ['service', '遠端網路服務']],
        ['device', 'lan', 'router', 'internet', 'service'], 3, ['先離開自己的裝置和區域網路，才進得了網際網路。']),
    task(6, 'dns', 'choice', '名與址',
        '在瀏覽器輸入網址時，負責把網域名稱轉換成 IP 位址的是什麼？',
        [['dns', 'DNS（網域名稱系統）'], ['router', '路由器'], ['search', '搜尋引擎（例如 Google）'], ['bookmark', '瀏覽器的書籤']],
        'dns', 3, ['它的工作像電話簿：用名字查號碼。', '搜尋引擎是幫你找網站，不是把網址換成號碼。']),
    task(6, 'network-services', 'multi', '哪些是網路服務',
        '選出所有通常要連上網路，才能取得內容或功能的服務。',
        [
            ['email', '收發電子郵件'], ['web', '瀏覽網頁'], ['stream', '線上看影片'],
            ['cloud', '雲端硬碟'], ['calc', '手機內建計算機'], ['camera', '用手機相機拍照']
        ], ['cloud', 'email', 'stream', 'web'], 3, ['這個功能的內容，是從遠方送來的，還是手機自己就能做？']),
    task(6, 'edge-cloud', 'match', '就地施法',
        '把每項工作分到比較適合的地方處理。',
        [
            ['car', '自駕車判斷前方有沒有行人'], ['redlight', '路口攝影機偵測闖紅燈'], ['translate', '沒有網路時的離線翻譯'],
            ['backup', '備份一萬張照片'], ['coedit', '全班同時編輯同一份文件'], ['train', '訓練大型 AI 模型']
        ], {backup: 'cloud', car: 'edge', coedit: 'cloud', redlight: 'edge', train: 'cloud', translate: 'edge'}, 4,
        ['要立刻反應、不能怕斷線的，放哪裡？', '需要大量資源，或要讓很多人共用的，放哪裡？'],
        {bins: [['edge', '就地處理（邊緣）'], ['cloud', '交給雲端']]}),
    seal(6, 'seal-network', ['網路服務要靠一站一站完整的連線', '本地、邊緣與雲端各有優缺點']),

    story(7, 'black-box', '預言不是真相',
        '你查得天機鏡的輸入缺了一角，它卻仍以篤定之語生成預言。長老終於承認：「吾等把一段輸出，當成了查證過的事實。」',
        'Token（詞元）是模型處理文字的單位之一，不等於真實或知識。模型的輸出，要用外部證據和人的判斷來核對。',
        '靈氣再多，也不代表每句話都是真相；修行者的職責是查證。'),
    task(7, 'token-truth', 'multi', 'Token 真假辨',
        '選出兩個正確的說法。',
        [
            ['unit', 'Token 是模型處理文字時切出來的小單位'],
            ['context', '模型一次能處理的 Token 有上限，會影響它能參考多少內容'],
            ['word', '一個中文字一定剛好是一個 Token'],
            ['truth', 'Token 越多，輸出就越正確']
        ], ['context', 'unit'], 3, ['Token 是處理單位，不是真理單位。', '中文怎麼切，要看模型怎麼設計。']),
    task(7, 'training-data', 'choice', '未見之雨',
        '一個只用晴天照片訓練的天氣辨識模型，遇到暴雨照片時，最可能發生什麼？',
        [
            ['error', '判斷容易出錯，而且可能說得很有把握'],
            ['unknown', '模型會回答「我不知道」'],
            ['search', '模型會自己上網查暴雨的資料'],
            ['learn', '模型看一眼就學會暴雨是什麼']
        ], 'error', 3, ['模型只能從看過的資料裡學習。', '它會不會知道自己沒學過？']),
    task(7, 'verify-output', 'choice', '查證關',
        '天機鏡很有自信地說「明日必有大劫」，卻沒有附上來源。下一步最適當的是什麼？',
        [
            ['verify', '查官方公告和感測紀錄，由人確認後再決定'],
            ['ask2', '換另一個 AI 問，兩個都這樣說就相信'],
            ['cite', '請它附上來源，只要有附就相信'],
            ['repeat', '再問它一次，答案一樣就相信']
        ], 'verify', 3, ['信心語氣不是證據。', '同一個來源問兩次，算不算兩個證據？']),
    task(7, 'human-check', 'multi', '立新門規',
        '要讓天機鏡以後更可靠，選出所有合理的做法。',
        [
            ['sources', '輸出要附上資料來源與時間'], ['review', '重要決定由人查證後再執行'],
            ['logs', '保存輸入資料與系統紀錄，方便追查'], ['bigger', '換成更大的模型，就不必再查證'],
            ['selfcheck', '讓 AI 自己檢查自己的答案就夠了']
        ], ['logs', 'review', 'sources'], 3, ['好的門規讓錯誤更容易被發現，而不是假設它不會發生。']),
    seal(7, 'seal-ai', ['Token 不等於真實；訓練資料沒涵蓋的，模型容易出錯', 'AI 輸出要用來源、紀錄和人的判斷交叉查證']),

    story(8, 'trial', '五段故障鏈',
        '諸般證據，盡攤於調查桌上：雲端連線中斷、未經查證的預言、感測資料殘缺、GPU 工作退回 CPU、記憶體幾近耗盡。孰先孰後？須依紀錄定之。',
        '實際故障常是好幾層連鎖發生。診斷要依時間、系統日誌與可重現的證據，建立故障鏈。',
        '天劫不是單一雷擊，而是一連串沒有及時處理的警訊。'),
    task(8, 'final-chain', 'order', '提交事故卷宗',
        '對照上面的系統日誌，依發生時間，把五個故障由第 1 個排到第 5 個。',
        [
            ['bad-input', '感測器輸入資料不完整'], ['memory-pressure', '記憶體壓力持續升高'],
            ['cpu-fallback', 'GPU 工作退回 CPU，處理排隊'], ['network-loss', '雲端備援連線中斷'],
            ['unverified-output', '未經查證的輸出被當成事實']
        ], ['bad-input', 'memory-pressure', 'cpu-fallback', 'network-loss', 'unverified-output'], 10,
        ['每個故障，對應日誌裡的哪一行？', '看時間，由早到晚。'],
        {evidence: [
            '08:11  網路　　無法連線到雲端備援伺服器',
            '07:58  感測器　3 號感測器回傳的資料缺少 40%',
            '08:15  公告　　「明日天機城必將毀滅」已發布，未經人工確認',
            '08:03  系統　　記憶體使用率 97%，開始頻繁搬移資料',
            '08:05  加速器　GPU 記憶體不足，影像分析改由 CPU 執行'
        ]}),
    task(8, 'fix-plan', 'multi', '對症下藥',
        '根據剛才排出的事故鏈，下列哪些是真正改善問題、避免事故再發生的做法？（可以選多項）',
        [
            ['sensor', '檢查感測器，資料不完整時發出警告'], ['memory', '監看記憶體用量，必要時增加資源'],
            ['backup', '為雲端連線準備備援路線'], ['verify', '重要公告必須由人查證後才能發布'],
            ['cpu', '換一顆最快的 CPU 就好'], ['mute', '關掉感測器，免得再送錯資料']
        ], ['backup', 'memory', 'sensor', 'verify'], 3,
        ['對照事故鏈的五個環節，每個修復都要對應其中一環。', '關掉感測器，是解決問題，還是看不到問題？']),
    {chapter: 8, id: 'finale', type: 'final', title: '真相道印', points: 0,
        narrative: '天機城並未遭遇神祕叛變。它遭遇的，是輸入、記憶體、處理器、網路與人類判斷的連鎖失誤。你將九枚道印放回城心，天機鏡重新亮起，這次它只說：「我能計算，也能產生答案；但真相，需要證據。」'}
];

export const TASKS = STEPS.filter(step => !['story', 'seal', 'final'].includes(step.type));
export const TOTAL_POINTS = TASKS.reduce((sum, step) => sum + step.points, 0);
if (TOTAL_POINTS !== 100) throw new Error('CULTIVATION_RUBRIC_MISMATCH');
if (new Set(STEPS.map(step => step.id)).size !== STEPS.length) throw new Error('CULTIVATION_STEP_ID_DUPLICATE');

const stable = value => {
    if (Array.isArray(value)) return value.map(stable);
    if (value && typeof value === 'object') return Object.fromEntries(Object.keys(value).sort().map(key => [key, stable(value[key])]));
    return value;
};
const plainObject = value => value && typeof value === 'object' && !Array.isArray(value);

export const validAnswer = (step, value) => {
    const ids = new Set((step.choices || []).map(([id]) => id));
    if (step.type === 'choice') return typeof value === 'string' && ids.has(value);
    if (step.type === 'order') return Array.isArray(value) && value.length === ids.size && new Set(value).size === value.length && value.every(id => ids.has(id));
    if (step.type === 'multi') return Array.isArray(value) && value.length <= ids.size && new Set(value).size === value.length && value.every(id => ids.has(id));
    if (step.type === 'match') {
        const bins = new Set((step.bins || DEFAULT_BINS).map(([id]) => id));
        return plainObject(value) && Object.keys(value).sort().join('|') === [...ids].sort().join('|') &&
            Object.values(value).every(item => bins.has(item));
    }
    if (step.type === 'path') {
        const nodes = new Set(step.nodes.map(([id]) => id));
        return Array.isArray(value) && value.length >= 1 && value.length <= 10 && value.every(id => nodes.has(id));
    }
    if (step.type === 'program') {
        const edit = step.machine.edit;
        return plainObject(value) && Object.keys(value).sort().join('|') === Object.keys(edit).sort().join('|') &&
            Object.entries(value).every(([cell, op]) => edit[cell].includes(op));
    }
    return false;
};

export const correctAnswer = (step, value) => {
    if (step.type === 'program') {
        return JSON.stringify(runMachine(applyEdits(step.machine, value)).output) === JSON.stringify(step.machine.goal);
    }
    return JSON.stringify(stable(value)) === JSON.stringify(stable(step.answer));
};
