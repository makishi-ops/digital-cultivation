export const COURSE_VERSION = 'digital-cultivation-2';

export const CHAPTERS = [
    {id: 'prologue', title: '序章·飛昇大典', seal: '入門道印'},
    {id: 'evolution', title: '第一章·上古機關城', seal: '演進道印'},
    {id: 'architecture', title: '第二章·五府經脈', seal: '架構道印'},
    {id: 'memory', title: '第三章·藏經閣塞車', seal: '記憶道印'},
    {id: 'os', title: '第四章·掌門調度令', seal: '調度道印'},
    {id: 'accelerator', title: '第五章·金丹萬劍陣', seal: '平行道印'},
    {id: 'network', title: '第六章·洞天斷訊', seal: '雲海道印'},
    {id: 'ai', title: '第七章·天機黑箱', seal: '求真道印'},
    {id: 'final', title: '終章·結案', seal: '真相道印'}
];

const story = (chapter, id, title, narrative, truth, metaphor) => ({
    chapter, id, type: 'story', title, narrative, truth, metaphor, points: 0
});
const task = (chapter, id, type, title, prompt, choices, answer, points = 5, hints = []) => ({
    chapter, id, type, title, prompt, choices, answer, points, hints
});
const seal = (chapter, id, learned) => ({chapter, id, type: 'seal', title: CHAPTERS[chapter].seal, learned, points: 0});

export const STEPS = [
    story(0, 'arrival', '天機鏡的錯誤預言',
        '飛昇大典前夕，天機鏡忽然宣告「明日天機城必將毀滅」，接著全城螢幕燈火盡滅。眾人說這是 AI 失控，你卻在機房門口撿到一張寫著「先查系統，再談神通」的紙條。',
        '資訊系統由硬體、軟體、資料與連線共同運作；AI 也必須執行於實際系統上。',
        '修士的神通需要經脈、靈氣與法器，AI 也需要完整的系統平臺。'),
    task(0, 'platform-scope', 'choice', '第一份證物',
        '下列哪一項最接近「系統平臺」的意思？',
        [
            ['app', '只是一個應用程式'],
            ['system', '讓硬體、作業系統和應用程式共同運作的基礎環境'],
            ['internet', '只是網際網路'],
            ['cpu', '只是 CPU']
        ], 'system', 3, ['想想手機為什麼不是只有一顆處理器。', '系統平臺是多個層次合作的環境。']),
    task(0, 'platform-layers', 'order', '留影術',
        '天機鏡欲施留影術，攝城門之景。這道拍照指令從發出到完成，依序經過哪三層？請由第 1 層排到第 3 層。',
        [
            ['app', '招式——預言程式（應用程式）發出「拍照」指令'],
            ['os', '功法——作業系統接收指令，調度鏡頭與處理器'],
            ['hardware', '法器——鏡頭與處理器（硬體）實際拍下影像']
        ], ['app', 'os', 'hardware'], 3, ['出招在先，法器在後。', '應用程式不能直接驅使硬體，中間要經過作業系統。']),
    seal(0, 'seal-entry', ['系統平臺不等於單一零件', 'AI 仍受硬體、軟體與網路限制']),

    story(1, 'archive', '歷代法器年表',
        '檔案室留著巨型機房、個人電腦、行動裝置與雲端洞天的影像。長老說這些不是淘汰關係，而是不同時代與用途的選擇。',
        '系統平臺從集中式大型電腦，發展出個人電腦、行動裝置、雲端與邊緣運算等形式。',
        '洞府變小、宗門變大；運算能在手上，也能在遠方資料中心。'),
    task(1, 'evolution-order', 'order', '排回時間軸',
        '將下列平臺依大致的普及順序由早到晚排列。',
        [
            ['mainframe', '大型電腦與終端'],
            ['pc', '個人電腦'],
            ['mobile', '智慧型手機與行動平臺'],
            ['cloud', '大規模雲端服務']
        ], ['mainframe', 'pc', 'mobile', 'cloud'], 3, ['先想「整間機房」，再想「每人一台」。', '行動裝置普及後，雲端服務才更大規模進入日常。']),
    task(1, 'stored-program', 'choice', '改寫機關還是更換法術',
        '儲存程式概念的關鍵是什麼？',
        [
            ['rewire', '每次換任務都要重接電路'],
            ['shared', '程式指令和資料都能存在記憶體中，交給處理器取用'],
            ['network', '所有程式必須放在網路'],
            ['gpu', '只有 GPU 才能儲存程式']
        ], 'shared', 3, ['程式也可以當成資料被讀取。']),
    task(1, 'mobile-platform', 'choice', '隨身洞府',
        '昔日機關一城，萬人共用；今朝洞府隨身，人手一方。智慧型手機和早期大型電腦相比，最大的改變是什麼？',
        [
            ['personal', '運算能力變成每人隨身一台，並結合感測器與行動網路'],
            ['no-cpu', '手機不需要處理器'],
            ['no-os', '手機沒有作業系統'],
            ['offline', '手機只能離線使用']
        ], 'personal', 3, ['手機裡也有處理器、記憶體和作業系統；改變的是誰在用、在哪裡用。']),
    seal(1, 'seal-evolution', ['平臺會演進，但舊形式不一定消失', '儲存程式讓同一系統能執行不同任務']),

    story(2, 'meridians', '資料流向失蹤',
        '鍵盤已送出指令，螢幕卻沒有顯示。你必須沿著「輸入→記憶→處理→輸出」的經脈逐站檢查。',
        '電腦透過輸入、處理、記憶與輸出協同運作；CPU 內含控制與算術邏輯等功能。',
        '經脈不通，法術再強也無法顯現。'),
    task(2, 'data-path', 'order', '接回資料經脈',
        '將「從鍵盤輸入字元，到螢幕顯示」的簡化流程排好。',
        [
            ['input', '輸入裝置送出資料'],
            ['memory-in', '資料進入記憶體'],
            ['cpu', 'CPU 取得指令與資料並處理'],
            ['memory-out', '處理結果放回記憶體'],
            ['output', '輸出裝置顯示結果']
        ], ['input', 'memory-in', 'cpu', 'memory-out', 'output'], 3, ['輸入不會直接跳到螢幕。', 'CPU 處理前後都可能需要和記憶體交換資料。']),
    task(2, 'cpu-parts', 'multi', 'CPU 雙堂會審',
        '選出兩個最直接屬於 CPU 核心工作的項目。',
        [
            ['control', '解碼指令並控制執行'],
            ['alu', '進行算術與邏輯運算'],
            ['print', '將墨水印到紙上'],
            ['wifi', '發射 Wi-Fi 無線電波']
        ], ['alu', 'control'], 3, ['一項和指令有關，一項和計算與比較有關。']),
    task(2, 'input-devices', 'multi', '誰在向系統說話',
        '選出兩個主要擔任輸入的裝置。',
        [
            ['keyboard', '鍵盤'], ['camera', '攝影機'], ['screen', '螢幕'], ['speaker', '喇叭']
        ], ['camera', 'keyboard'], 3, ['哪些裝置把現實世界或使用者的資料送入電腦？']),
    task(2, 'touchscreen', 'choice', '一鏡雙通',
        '天機鏡面，指觸即亮。觸控螢幕屬於哪一種裝置？',
        [
            ['input', '只是輸入裝置'],
            ['output', '只是輸出裝置'],
            ['both', '同時是輸入裝置和輸出裝置'],
            ['storage', '儲存裝置']
        ], 'both', 3, ['手指碰到螢幕時，資料往哪裡走？畫面出現時，資料又往哪裡走？']),
    seal(2, 'seal-architecture', ['資料經過輸入、記憶、處理與輸出', 'CPU 不是整台電腦']),

    story(3, 'library-fire', '藏經閣為何越讀越慢',
        '天機鏡同時展開太多卷宗，快速書桌已滿，只能不斷往遠方庫房搬送。資料仍在，速度卻驟降。',
        'RAM 適合放目前執行所需資料，儲存裝置用於長期保留；不同層級在速度、容量與價格間取捨。',
        '手邊書桌快但小，庫房大卻較遠。'),
    task(3, 'ram-or-storage', 'choice', '閉關筆記放哪裡',
        '程式執行中、處理器正在頻繁使用的資料，通常優先放在哪裡？',
        [['ram', 'RAM'], ['storage', '長期儲存裝置'], ['printer', '印表機'], ['router', '路由器']], 'ram', 3,
        ['關機後不一定需要保留、但執行中需要快速取用。']),
    task(3, 'power-loss', 'choice', '靈石斷供',
        '靈石一斷，滿城燈滅。天機城突然停電，重新開機後，哪一種資料最可能不見？',
        [
            ['ram', 'RAM 裡還沒存檔的資料'],
            ['ssd', '已經存到 SSD 的檔案'],
            ['cloud', '已經上傳到雲端的檔案'],
            ['usb', '已經存進隨身碟的檔案']
        ], 'ram', 3, ['想想哪一種記憶體需要一直有電，才能保留內容。']),
    task(3, 'memory-order', 'order', '藏經閣速度階梯',
        '將常見儲存層級排序：第 1 個放最接近 CPU、通常最快的一層，最後放離 CPU 最遠、最慢的一層。',
        [['register', '暫存器'], ['cache', '快取記憶體'], ['ram', 'RAM'], ['storage', 'SSD／長期儲存']],
        ['register', 'cache', 'ram', 'storage'], 3, ['暫存器在處理器內最貼近運算單元。']),
    task(3, 'memory-bottleneck', 'choice', '災情判讀',
        'CPU 一直等待資料從較慢的儲存層搬入，這最接近什麼問題？',
        [['move', '資料搬移與記憶體瓶頸'], ['color', '螢幕色偏'], ['sound', '喇叭音量太小'], ['password', '密碼太長']], 'move', 3,
        ['運算單元很快，不代表資料能同樣快地到達。']),
    seal(3, 'seal-memory', ['速度、容量與成本需要取捨', '計算慢可能是等資料，不一定是 CPU 太慢']),

    story(4, 'scheduler', '掌門不是幫大家算題',
        '數十個程式同時爭搶 CPU、記憶體與裝置。作業系統像掌門，不是親自完成每一個任務，而是管理資源與秩序。',
        '作業系統管理程序、記憶體、檔案、裝置、使用者與權限，並提供應用程式使用硬體的共通環境。',
        '掌門管法器、排課與門禁，不代替每位弟子修練。'),
    task(4, 'os-jobs', 'multi', '掌門的職責',
        '選出所有屬於作業系統的常見核心工作。',
        [['process', '管理執行中的程式'], ['memory', '分配記憶體'], ['files', '管理檔案'], ['devices', '協調輸入輸出裝置'], ['essay', '替使用者寫完所有文章']],
        ['devices', 'files', 'memory', 'process'], 3, ['作業系統管「共用資源」，不是自動完成使用者的內容工作。']),
    task(4, 'os-examples', 'multi', '掌門名冊',
        '掌門名冊之上，混入尋常弟子之名。選出所有屬於作業系統的軟體。',
        [
            ['windows', 'Windows'],
            ['android', 'Android'],
            ['ios', 'iOS'],
            ['linux', 'Linux'],
            ['browser', '網頁瀏覽器'],
            ['game', '手機遊戲']
        ], ['android', 'ios', 'linux', 'windows'], 3, ['作業系統管理整台裝置；瀏覽器和遊戲是裝在作業系統上的應用程式。']),
    task(4, 'scheduling', 'choice', '誰決定下一個執行',
        '多個程式同時等待 CPU 時，主要由誰進行排程與切換？',
        [['os', '作業系統'], ['keyboard', '鍵盤'], ['monitor', '螢幕'], ['document', '使用者的文件']], 'os', 3,
        ['想想哪個系統軟體負責管理程式。']),
    task(4, 'permissions', 'choice', '門禁測試',
        '某應用程式沒有相機權限，最適當的系統行為是？',
        [['deny', '拒絕存取，必要時請使用者明確授權'], ['allow', '因為應用程式有需要就自動允許'], ['share', '把相機畫面公開給所有程式'], ['delete', '刪除使用者的所有檔案']], 'deny', 3,
        ['權限是保護資源的邊界，不能因程式想用就自動放行。']),
    seal(4, 'seal-os', ['作業系統管理資源、程序、檔案、裝置與權限', '應用程式不應自行越過系統權限']),

    story(5, 'golden-core', '萬劍齊發不等於萬事皆能',
        '長老要把每個任務都交給 GPU，卻發現開機、一步一步的控制與複雜分支並沒有自動變快。',
        'CPU 擅長通用、低延遲與複雜控制流程；GPU 擅長大量可平行處理的相似運算。實際系統常由多種處理器合作。',
        'CPU 像臨場指揮，GPU 像同時結陣的大量弟子。'),
    task(5, 'workload-match', 'match', '法術分派',
        '為每項工作選擇較合適的主要處理器。',
        [
            ['boot', '作業系統開機與複雜控制流程'],
            ['serial', '下一步依賴上一步結果的連續決策'],
            ['pixels', '數百萬個像素套用相似的運算'],
            ['matrix', '大量矩陣元素的平行運算']
        ], {boot: 'cpu', serial: 'cpu', pixels: 'gpu', matrix: 'gpu'}, 3,
        ['「大量、相似、可同時」的工作通常更適合 GPU。']),
    task(5, 'gpu-truth', 'choice', '結丹真相',
        '下列哪一句對 GPU 的描述最準確？',
        [['replace', 'GPU 已完全取代 CPU'], ['magic', '任何程式放到 GPU 都一定變快'], ['accelerator', 'GPU 是對大量平行運算很有用的加速器，但仍受記憶體與資料搬移等限制'], ['storage', 'GPU 的主要用途是長期儲存檔案']],
        'accelerator', 3, ['「擅長某種任務」不等於「能取代所有元件」。']),
    task(5, 'multicore', 'choice', '八道分身',
        '陣中指揮煉成八道分身，長老以為從此萬事快八倍。一台電腦的 CPU 有 8 個核心，下列說法何者正確？',
        [
            ['parallel', '可以同時執行多個工作，但不是每個程式都會快 8 倍'],
            ['eight-times', '所有程式都一定快 8 倍'],
            ['eight-gpu', '代表電腦裡有 8 顆 GPU'],
            ['eight-gb', '代表記憶體有 8 GB']
        ], 'parallel', 3, ['一個工作如果必須一步接一步做，多了分身也不一定變快。']),
    task(5, 'npu', 'choice', '專煉一丹',
        '萬劍堂旁另闢丹房，只煉一種丹。許多新手機裡有 NPU（神經網路處理器），它主要用來做什麼？',
        [
            ['ai', '加速人臉辨識、語音辨識等 AI 運算'],
            ['battery', '增加電池容量'],
            ['storage', '長期保存照片'],
            ['wifi', '取代 Wi-Fi 連線']
        ], 'ai', 3, ['看名字裡的「神經網路」，想想它和哪一類運算有關。']),
    seal(5, 'seal-accelerator', ['CPU 與 GPU 適合的工作不同', 'GPU 無法消除所有系統瓶頸']),

    story(6, 'broken-link', '洞府沒壞，仙界卻聯絡不上',
        '本地電腦能正常運作，但雲端模型、電子郵件與網頁都無法使用。線索指向一條中斷的網路路徑。',
        '裝置可透過區域網路、路由器與網際網路取用遠端服務；雲端、邊緣與本地運算各有來回取捨。',
        '洞府是本地裝置，仙界宗門像遠端資料中心；傳送陣斷了，雲端神通就無法抵達。'),
    task(6, 'network-path', 'order', '修復傳送陣',
        '將家中或教室裝置連到網路服務的簡化路徑排好。',
        [['device', '使用者裝置'], ['lan', '本地有線／無線區域網路'], ['router', '路由器／閘道器'], ['internet', '網際網路'], ['service', '遠端網路服務']],
        ['device', 'lan', 'router', 'internet', 'service'], 3, ['先離開自己的裝置和區域網路，再進入網際網路。']),
    task(6, 'dns', 'choice', '陣譜',
        '傳送陣只認座標，不認宗門之名。在瀏覽器輸入網址時，負責把網域名稱轉換成 IP 位址的是什麼？',
        [
            ['dns', 'DNS（網域名稱系統）'],
            ['ram', 'RAM'],
            ['gpu', 'GPU'],
            ['usb', 'USB 連接埠']
        ], 'dns', 3, ['它就像陣前那卷陣譜：用好記的名字，查出真正的座標。']),
    task(6, 'network-services', 'multi', '哪些是網路服務',
        '選出所有通常需透過網路提供內容或功能的服務。',
        [['email', '電子郵件'], ['web', '全球資訊網'], ['stream', '隨選視訊'], ['cloud', '雲端儲存'], ['calculator', '不連網也可使用的本機計算機']],
        ['cloud', 'email', 'stream', 'web'], 3, ['判斷重點是功能主要在遠端提供，不是應用程式有沒有圖示。']),
    task(6, 'edge-cloud', 'choice', '就地施法',
        '城門守衛鏡須於彈指間辨人，而傳送陣時通時斷。像這樣的路口攝影機，辨識工作較適合放在哪裡？',
        [
            ['edge', '攝影機旁的邊緣裝置，直接在現場處理'],
            ['cloud-only', '全部傳到遠方雲端，等結果傳回來'],
            ['printer', '交給印表機處理'],
            ['none', '不需要任何運算']
        ], 'edge', 3, ['要「立刻」反應，又不能怕斷線，運算應該離資料近一點還是遠一點？']),
    seal(6, 'seal-network', ['網路服務依賴完整的連線路徑', '本地、邊緣與雲端各有優缺點']),

    story(7, 'black-box', '預言不是真相',
        '你查到天機鏡的輸入資料缺了一部分，它卻仍用篤定的語氣生成預言。長老終於承認：「我們把一段輸出，當成了經過驗證的事實。」',
        'Token（詞元）是模型處理內容的單位之一，不等於真實、知識或所有資料。模型輸出需以外部證據與人類判斷核對。',
        '靈氣再多也不代表每句話都是真相；修行者的職責是查證。'),
    task(7, 'token-truth', 'multi', 'Token 真假辨',
        '選出兩個正確的說法。',
        [['unit', 'Token 可以是模型處理文字時的分割單位'], ['context', '模型能處理的 Token 數量會影響它一次能參考的內容範圍'], ['truth', '只要 Token 夠多，輸出就必然正確'], ['all-data', 'Token 和世界上所有資料是完全相同的概念']],
        ['context', 'unit'], 3, ['Token 是處理單位，不是真理單位。']),
    task(7, 'training-data', 'choice', '未見之雨',
        '天機鏡所閱，唯晴日城景。只用「晴天」資料訓練的模型，遇到暴雨時最可能發生什麼？',
        [
            ['error', '判斷容易出錯，因為訓練資料沒有涵蓋這種情況'],
            ['perfect', '一樣完全正確，AI 會自己懂'],
            ['faster', '會算得更快'],
            ['same', '不受任何影響']
        ], 'error', 3, ['所學不出所見：模型只能從看過的資料裡學習。']),
    task(7, 'verify-output', 'choice', '查證關',
        'AI 對重要事件給出很有自信、卻沒有來源的結論時，最適當的下一步是什麼？',
        [['verify', '查找可靠資料與實際系統證據，由人確認後再行動'], ['believe', '因為語氣有自信就直接相信'], ['repeat', '不斷重複詢問直到它給出喜歡的答案'], ['hide', '刪除所有原始記錄']],
        'verify', 3, ['信心語氣不是證據。']),
    task(7, 'human-check', 'multi', '立新門規',
        '長老欲立門規，以免再將一段輸出奉為預言。要讓天機鏡以後更可靠，選出所有合理的做法。',
        [
            ['sources', '輸出要附上資料來源與時間'],
            ['review', '重要決定由人查證後再執行'],
            ['logs', '保存輸入資料與系統紀錄，方便追查'],
            ['auto', '只要語氣有自信就自動執行'],
            ['erase', '出錯時刪除紀錄，避免被發現']
        ], ['logs', 'review', 'sources'], 3, ['好的門規讓錯誤更容易被發現，而不是被藏起來。']),
    seal(7, 'seal-ai', ['Token 不等於真實或知識', 'AI 輸出應和資料、系統狀態與人類判斷交叉驗證']),

    story(8, 'trial', '五段故障鏈',
        '所有卷宗放上調查桌：感測器先送來不完整資料；RAM 幾乎耗盡；原應由 GPU 加速的工作退回 CPU；雲端連線中斷；最後，眾人將未經查證的模型輸出當成預言。',
        '實際故障常是多個層次連鎖影響。診斷應依時間、日誌、資源與可重現證據建立故障鏈。',
        '天劫不是單一雷擊，而是一連串沒有及時處理的警訊。'),
    task(8, 'final-chain', 'order', '提交事故卷宗',
        '依證據發生順序排出事故鏈。',
        [['bad-input', '感測器輸入資料不完整'], ['memory-pressure', '記憶體壓力持續升高'], ['cpu-fallback', 'GPU 工作退回 CPU，處理排隊'], ['network-loss', '雲端備援連線中斷'], ['unverified-output', '未經查證的模型輸出被當成事實']],
        ['bad-input', 'memory-pressure', 'cpu-fallback', 'network-loss', 'unverified-output'], 10,
        ['先找到最早進入系統的問題，最後才是人如何使用輸出。']),
    task(8, 'fix-plan', 'multi', '對症下藥',
        '病在何處，藥下何處。選出所有能降低這次事故再發生的修復措施。',
        [
            ['sensor', '檢查感測器，資料不完整時發出警告'],
            ['memory', '監看記憶體用量，必要時釋放或增加資源'],
            ['backup', '為雲端連線準備備援路線'],
            ['verify', '模型輸出查證後才能公告'],
            ['screen', '把天機鏡的螢幕換大一點']
        ], ['backup', 'memory', 'sensor', 'verify'], 3, ['對照事故鏈的五個環節，每個修復都要能對應其中一環。']),
    {chapter: 8, id: 'finale', type: 'final', title: '真相道印', points: 0,
        narrative: '天機城沒有遭遇神祕叛變。它遭遇的是輸入、記憶體、處理器、網路與人類判斷的連鎖失誤。你將九枚道印放回城心，天機鏡重新亮起，這次它只說：「我能計算與產生答案，但真相需要證據。」'}
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

export const validAnswer = (step, value) => {
    const ids = new Set((step.choices || []).map(([id]) => id));
    if (step.type === 'choice') return typeof value === 'string' && ids.has(value);
    if (step.type === 'order') return Array.isArray(value) && value.length === ids.size && new Set(value).size === value.length && value.every(id => ids.has(id));
    if (step.type === 'multi') return Array.isArray(value) && value.length <= ids.size && new Set(value).size === value.length && value.every(id => ids.has(id));
    if (step.type === 'match') {
        return value && typeof value === 'object' && !Array.isArray(value) &&
            Object.keys(value).sort().join('|') === [...ids].sort().join('|') &&
            Object.values(value).every(item => item === 'cpu' || item === 'gpu');
    }
    return false;
};

export const correctAnswer = (step, value) => JSON.stringify(stable(value)) === JSON.stringify(stable(step.answer));

