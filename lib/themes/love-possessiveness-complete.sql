-- ============================================
-- 恋爱占有欲指数测评主题（完整版 25 题）
-- 基于五大维度：依恋安全感、控制与边界、信任基础、情绪反应、关系认知
-- ============================================

-- 1. 创建主题
INSERT INTO themes (id, name, description, cover_image, price, question_count, estimated_time, status)
VALUES (
  'love-possessiveness',
  '恋爱占有欲指数',
  '基于依恋理论和关系心理学，深度解析你在恋爱中的占有欲模式、安全感需求和情感边界',
  '/images/themes/love-possessiveness.jpg',
  19.90,
  25,
  10,
  'active'
);

-- 2. 添加题目（25题完整版）
INSERT INTO questions (theme_id, order_num, question_text, question_type, is_required) VALUES
-- 维度一：依恋安全感（Q1-Q5）
('love-possessiveness', 1, '当恋人超过1小时没回复消息，你的真实反应是：', 'single_choice', true),
('love-possessiveness', 2, '你对恋爱中"分离"的感受是：', 'single_choice', true),
('love-possessiveness', 3, '在关系初期，你最需要的是：', 'single_choice', true),
('love-possessiveness', 4, '当伴侣说"我需要一些个人空间"时：', 'single_choice', true),
('love-possessiveness', 5, '你理想中的相处状态是：', 'single_choice', true),

-- 维度二：控制与边界（Q6-Q11）
('love-possessiveness', 6, '关于查看伴侣的手机，你的真实想法是：', 'single_choice', true),
('love-possessiveness', 7, '伴侣要和异性朋友单独吃饭，你会：', 'single_choice', true),
('love-possessiveness', 8, '你希望伴侣的社交媒体是怎样的：', 'single_choice', true),
('love-possessiveness', 9, '当伴侣的周末计划里没有你时：', 'single_choice', true),
('love-possessiveness', 10, '关于对方的行踪，你认为：', 'single_choice', true),
('love-possessiveness', 11, '你会因为这些原因希望伴侣做出改变：', 'single_choice', true),

-- 维度三：信任基础（Q12-Q16）
('love-possessiveness', 12, '当伴侣临时改变计划或晚归时：', 'single_choice', true),
('love-possessiveness', 13, '伴侣的手机突然设置了密码，你的反应：', 'single_choice', true),
('love-possessiveness', 14, '关于伴侣的异性朋友，你能接受：', 'single_choice', true),
('love-possessiveness', 15, '当无法联系到伴侣超过2小时：', 'single_choice', true),
('love-possessiveness', 16, '你认为建立信任的最佳方式是：', 'single_choice', true),

-- 维度四：情绪反应（Q17-Q21）
('love-possessiveness', 17, '看到伴侣和异性聊得很开心时：', 'single_choice', true),
('love-possessiveness', 18, '当伴侣夸奖其他人有魅力时：', 'single_choice', true),
('love-possessiveness', 19, '关于伴侣的前任，你的真实态度是：', 'single_choice', true),
('love-possessiveness', 20, '当伴侣的注意力被工作/爱好占据时：', 'single_choice', true),
('love-possessiveness', 21, '你表达嫉妒或不满的方式通常是：', 'single_choice', true),

-- 维度五：关系认知（Q22-Q25）
('love-possessiveness', 22, '你认为健康的恋爱关系应该是：', 'single_choice', true),
('love-possessiveness', 23, '关于恋爱后的朋友社交，你认为：', 'single_choice', true),
('love-possessiveness', 24, '当伴侣发展不包括你的兴趣爱好时：', 'single_choice', true),
('love-possessiveness', 25, '你对"恋人之间应该坦诚一切"的看法：', 'single_choice', true);

-- 3. 添加选项（每题4个选项，分值1-4分）
INSERT INTO question_options (question_id, option_text, option_value, order_num)
SELECT q.id, o.option_text, o.option_value, o.order_num
FROM questions q
CROSS JOIN LATERAL (VALUES
  -- Q1 选项
  ('A. 会立刻感到焦虑，忍不住发多条消息询问', 4, 1),
  ('B. 有些在意，会查看对方是否在线', 3, 2),
  ('C. 理解对方可能在忙，耐心等待', 2, 3),
  ('D. 完全不受影响，该干嘛干嘛', 1, 4)
) AS o(option_text, option_value, order_num)
WHERE q.theme_id = 'love-possessiveness' AND q.order_num = 1

UNION ALL

SELECT q.id, o.option_text, o.option_value, o.order_num
FROM questions q
CROSS JOIN LATERAL (VALUES
  -- Q2 选项
  ('A. 难以忍受，哪怕短暂分开也会想念到心痛', 4, 1),
  ('B. 会有些不安，需要频繁联系才能安心', 3, 2),
  ('C. 能够接受，但希望保持日常沟通', 2, 3),
  ('D. 很享受，认为距离让关系更健康', 1, 4)
) AS o(option_text, option_value, order_num)
WHERE q.theme_id = 'love-possessiveness' AND q.order_num = 2

UNION ALL

SELECT q.id, o.option_text, o.option_value, o.order_num
FROM questions q
CROSS JOIN LATERAL (VALUES
  -- Q3 选项
  ('A. 对方全部的注意力和时间', 4, 1),
  ('B. 频繁的联系和见面', 3, 2),
  ('C. 稳定的沟通和相互了解', 2, 3),
  ('D. 保持独立空间，慢慢培养感情', 1, 4)
) AS o(option_text, option_value, order_num)
WHERE q.theme_id = 'love-possessiveness' AND q.order_num = 3

UNION ALL

SELECT q.id, o.option_text, o.option_value, o.order_num
FROM questions q
CROSS JOIN LATERAL (VALUES
  -- Q4 选项
  ('A. 会感到被拒绝和不安，认为对方不够爱自己', 4, 1),
  ('B. 虽然理解但内心会有失落感', 3, 2),
  ('C. 能够理解并尊重对方的需求', 2, 3),
  ('D. 完全支持，自己也需要独处时间', 1, 4)
) AS o(option_text, option_value, order_num)
WHERE q.theme_id = 'love-possessiveness' AND q.order_num = 4

UNION ALL

SELECT q.id, o.option_text, o.option_value, o.order_num
FROM questions q
CROSS JOIN LATERAL (VALUES
  -- Q5 选项
  ('A. 时刻在一起，分享生活的每一刻', 4, 1),
  ('B. 大部分时间在一起，偶尔独处', 3, 2),
  ('C. 保持亲密但各有空间', 2, 3),
  ('D. 像独立的两个人，偶尔相聚', 1, 4)
) AS o(option_text, option_value, order_num)
WHERE q.theme_id = 'love-possessiveness' AND q.order_num = 5

UNION ALL

SELECT q.id, o.option_text, o.option_value, o.order_num
FROM questions q
CROSS JOIN LATERAL (VALUES
  -- Q6 选项
  ('A. 应该随时可以查看，恋人不该有秘密', 4, 1),
  ('B. 偶尔想看，但会克制自己', 3, 2),
  ('C. 除非对方主动分享，否则不会要求', 2, 3),
  ('D. 完全尊重隐私，不会有这个想法', 1, 4)
) AS o(option_text, option_value, order_num)
WHERE q.theme_id = 'love-possessiveness' AND q.order_num = 6

UNION ALL

SELECT q.id, o.option_text, o.option_value, o.order_num
FROM questions q
CROSS JOIN LATERAL (VALUES
  -- Q7 选项
  ('A. 明确表示反对，要求改变计划', 4, 1),
  ('B. 虽然不舒服但不会阻止，事后会表达不满', 3, 2),
  ('C. 内心有些介意，但选择信任', 2, 3),
  ('D. 完全没问题，朋友聚会很正常', 1, 4)
) AS o(option_text, option_value, order_num)
WHERE q.theme_id = 'love-possessiveness' AND q.order_num = 7

UNION ALL

SELECT q.id, o.option_text, o.option_value, o.order_num
FROM questions q
CROSS JOIN LATERAL (VALUES
  -- Q8 选项
  ('A. 公开恋情，减少与异性的互动', 4, 1),
  ('B. 公开恋情，但保持正常社交', 3, 2),
  ('C. 尊重对方选择，不做要求', 2, 3),
  ('D. 完全是个人自由，不需要讨论', 1, 4)
) AS o(option_text, option_value, order_num)
WHERE q.theme_id = 'love-possessiveness' AND q.order_num = 8

UNION ALL

SELECT q.id, o.option_text, o.option_value, o.order_num
FROM questions q
CROSS JOIN LATERAL (VALUES
  -- Q9 选项
  ('A. 会感到被忽视，希望对方改变计划', 4, 1),
  ('B. 有些失落，会暗示希望一起度过', 3, 2),
  ('C. 理解并支持，自己也安排活动', 2, 3),
  ('D. 很开心，正好有自己的时间', 1, 4)
) AS o(option_text, option_value, order_num)
WHERE q.theme_id = 'love-possessiveness' AND q.order_num = 9

UNION ALL

SELECT q.id, o.option_text, o.option_value, o.order_num
FROM questions q
CROSS JOIN LATERAL (VALUES
  -- Q10 选项
  ('A. 应该随时知道对方在哪里、和谁在一起', 4, 1),
  ('B. 希望对方主动告知大致行程', 3, 2),
  ('C. 重要活动知道就好，日常不需要汇报', 2, 3),
  ('D. 完全不需要知道，各自有自由', 1, 4)
) AS o(option_text, option_value, order_num)
WHERE q.theme_id = 'love-possessiveness' AND q.order_num = 10

UNION ALL

SELECT q.id, o.option_text, o.option_value, o.order_num
FROM questions q
CROSS JOIN LATERAL (VALUES
  -- Q11 选项
  ('A. 为了我们的关系，很多事都应该调整', 4, 1),
  ('B. 某些社交习惯应该为恋爱做出改变', 3, 2),
  ('C. 只在真正影响关系时才会沟通', 2, 3),
  ('D. 不会要求改变，接受对方本来的样子', 1, 4)
) AS o(option_text, option_value, order_num)
WHERE q.theme_id = 'love-possessiveness' AND q.order_num = 11

UNION ALL

SELECT q.id, o.option_text, o.option_value, o.order_num
FROM questions q
CROSS JOIN LATERAL (VALUES
  -- Q12 选项
  ('A. 会怀疑是否有隐瞒，忍不住追问细节', 4, 1),
  ('B. 内心会有疑虑，需要详细解释才能安心', 3, 2),
  ('C. 会询问原因，但相信对方的解释', 2, 3),
  ('D. 完全理解，计划本来就会变化', 1, 4)
) AS o(option_text, option_value, order_num)
WHERE q.theme_id = 'love-possessiveness' AND q.order_num = 12

UNION ALL

SELECT q.id, o.option_text, o.option_value, o.order_num
FROM questions q
CROSS JOIN LATERAL (VALUES
  -- Q13 选项
  ('A. 非常不安，会直接要求知道密码', 4, 1),
  ('B. 内心很介意，会旁敲侧击询问原因', 3, 2),
  ('C. 有些好奇但尊重隐私', 2, 3),
  ('D. 完全正常，每个人都有隐私权', 1, 4)
) AS o(option_text, option_value, order_num)
WHERE q.theme_id = 'love-possessiveness' AND q.order_num = 13

UNION ALL

SELECT q.id, o.option_text, o.option_value, o.order_num
FROM questions q
CROSS JOIN LATERAL (VALUES
  -- Q14 选项
  ('A. 只能接受群体社交，不能单独见面', 4, 1),
  ('B. 可以见面但希望自己知情', 3, 2),
  ('C. 信任对方的社交边界', 2, 3),
  ('D. 完全不介意，朋友很重要', 1, 4)
) AS o(option_text, option_value, order_num)
WHERE q.theme_id = 'love-possessiveness' AND q.order_num = 14

UNION ALL

SELECT q.id, o.option_text, o.option_value, o.order_num
FROM questions q
CROSS JOIN LATERAL (VALUES
  -- Q15 选项
  ('A. 会非常焦虑，不停尝试联系', 4, 1),
  ('B. 开始担心，会联系对方的朋友询问', 3, 2),
  ('C. 稍有担心，但会等待对方主动联系', 2, 3),
  ('D. 不会特别在意，相信对方没事', 1, 4)
) AS o(option_text, option_value, order_num)
WHERE q.theme_id = 'love-possessiveness' AND q.order_num = 15

UNION ALL

SELECT q.id, o.option_text, o.option_value, o.order_num
FROM questions q
CROSS JOIN LATERAL (VALUES
  -- Q16 选项
  ('A. 完全透明，随时知道对方的一切', 4, 1),
  ('B. 主动分享日常，保持高频沟通', 3, 2),
  ('C. 通过时间和行动慢慢建立', 2, 3),
  ('D. 给予自由和空间，自然发展', 1, 4)
) AS o(option_text, option_value, order_num)
WHERE q.theme_id = 'love-possessiveness' AND q.order_num = 16

UNION ALL

SELECT q.id, o.option_text, o.option_value, o.order_num
FROM questions q
CROSS JOIN LATERAL (VALUES
  -- Q17 选项
  ('A. 会立刻感到嫉妒，想要打断或离开', 4, 1),
  ('B. 内心不舒服，事后会表达不满', 3, 2),
  ('C. 有一点点吃醋，但能理解是正常社交', 2, 3),
  ('D. 完全不介意，看到对方开心也很高兴', 1, 4)
) AS o(option_text, option_value, order_num)
WHERE q.theme_id = 'love-possessiveness' AND q.order_num = 17

UNION ALL

SELECT q.id, o.option_text, o.option_value, o.order_num
FROM questions q
CROSS JOIN LATERAL (VALUES
  -- Q18 选项
  ('A. 会很生气，认为这是不尊重', 4, 1),
  ('B. 内心不悦，会表现出情绪', 3, 2),
  ('C. 稍有不适，但理解这只是客观评价', 2, 3),
  ('D. 完全没问题，欣赏美是人之常情', 1, 4)
) AS o(option_text, option_value, order_num)
WHERE q.theme_id = 'love-possessiveness' AND q.order_num = 18

UNION ALL

SELECT q.id, o.option_text, o.option_value, o.order_num
FROM questions q
CROSS JOIN LATERAL (VALUES
  -- Q19 选项
  ('A. 非常介意，希望对方断绝联系', 4, 1),
  ('B. 不希望有任何交集，包括社交媒体', 3, 2),
  ('C. 有些介意但不会过度要求', 2, 3),
  ('D. 那是过去，不会影响现在', 1, 4)
) AS o(option_text, option_value, order_num)
WHERE q.theme_id = 'love-possessiveness' AND q.order_num = 19

UNION ALL

SELECT q.id, o.option_text, o.option_value, o.order_num
FROM questions q
CROSS JOIN LATERAL (VALUES
  -- Q20 选项
  ('A. 会感到被忽视，要求对方多关注自己', 4, 1),
  ('B. 内心失落，会暗示希望更多陪伴', 3, 2),
  ('C. 理解并支持对方的事业和兴趣', 2, 3),
  ('D. 很好，各自都有热爱的事情', 1, 4)
) AS o(option_text, option_value, order_num)
WHERE q.theme_id = 'love-possessiveness' AND q.order_num = 20

UNION ALL

SELECT q.id, o.option_text, o.option_value, o.order_num
FROM questions q
CROSS JOIN LATERAL (VALUES
  -- Q21 选项
  ('A. 直接发脾气或冷战', 4, 1),
  ('B. 阴阳怪气或暗示不满', 3, 2),
  ('C. 冷静后理性沟通', 2, 3),
  ('D. 先自我调节，很少表达负面情绪', 1, 4)
) AS o(option_text, option_value, order_num)
WHERE q.theme_id = 'love-possessiveness' AND q.order_num = 21

UNION ALL

SELECT q.id, o.option_text, o.option_value, o.order_num
FROM questions q
CROSS JOIN LATERAL (VALUES
  -- Q22 选项
  ('A. 两个人融为一体，彼此是全部', 4, 1),
  ('B. 以恋爱为重心，其他都是次要的', 3, 2),
  ('C. 亲密但保持独立，互相支持', 2, 3),
  ('D. 像两个独立的人，恋爱是生活的一部分', 1, 4)
) AS o(option_text, option_value, order_num)
WHERE q.theme_id = 'love-possessiveness' AND q.order_num = 22

UNION ALL

SELECT q.id, o.option_text, o.option_value, o.order_num
FROM questions q
CROSS JOIN LATERAL (VALUES
  -- Q23 选项
  ('A. 应该大幅减少，把时间留给恋人', 4, 1),
  ('B. 可以保持但频率应该降低', 3, 2),
  ('C. 维持原有的朋友关系', 2, 3),
  ('D. 朋友同样重要，不应该改变', 1, 4)
) AS o(option_text, option_value, order_num)
WHERE q.theme_id = 'love-possessiveness' AND q.order_num = 23

UNION ALL

SELECT q.id, o.option_text, o.option_value, o.order_num
FROM questions q
CROSS JOIN LATERAL (VALUES
  -- Q24 选项
  ('A. 会感到被排斥，希望对方带上自己', 4, 1),
  ('B. 有些失落，但不会明说', 3, 2),
  ('C. 支持对方，自己也发展兴趣', 2, 3),
  ('D. 很好，各自都有独立的爱好', 1, 4)
) AS o(option_text, option_value, order_num)
WHERE q.theme_id = 'love-possessiveness' AND q.order_num = 24

UNION ALL

SELECT q.id, o.option_text, o.option_value, o.order_num
FROM questions q
CROSS JOIN LATERAL (VALUES
  -- Q25 选项
  ('A. 完全赞同，恋人间不应该有秘密', 4, 1),
  ('B. 大部分事情应该分享', 3, 2),
  ('C. 重要的事情坦诚，但保留个人空间', 2, 3),
  ('D. 每个人都有权保留隐私', 1, 4)
) AS o(option_text, option_value, order_num)
WHERE q.theme_id = 'love-possessiveness' AND q.order_num = 25;

-- 4. 添加评分规则（5个结果类型）
INSERT INTO scoring_rules (theme_id, min_score, max_score, result_title, result_content, result_tags, order_num) VALUES
('love-possessiveness', 25, 40, '低占有欲·回避型 ⭐',
'你在恋爱中展现出极低的占有欲，甚至可能偏向回避型依恋。你非常重视个人空间和独立性，很少对伴侣的行为产生控制欲或嫉妒感。

【优势】
• 给予伴侣充分的自由和信任
• 情绪稳定，不会因小事焦虑
• 尊重边界，关系压力小

【需要注意】
• 过度独立可能让伴侣感到疏离
• 适度的关心和在意是爱的表现
• 学会表达需求和情感连接

【建议】
在保持独立的同时，尝试增加情感投入和亲密互动。健康的关系需要平衡独立与依赖，让伴侣感受到你的重视和关心。',
'["独立型","理性","低焦虑","回避依恋"]', 1),

('love-possessiveness', 41, 55, '健康范围·安全型 ⭐⭐⭐',
'恭喜！你的占有欲处于健康范围，展现出安全型依恋特质。你能够在亲密与独立之间找到平衡，既重视关系又尊重边界。

【核心优势】
• 信任与自由并存，关系舒适度高
• 情绪稳定，沟通方式成熟
• 既能表达需求，也能尊重对方
• 安全感来自内在，不过度依赖外部确认

【关系特点】
你理解爱情是相互支持而非相互束缚，能够给予伴侣空间的同时保持情感连接。这种模式最有利于长期关系的稳定和双方的成长。

【持续成长】
继续保持这种平衡，在遇到冲突时坚持理性沟通，你的关系模式会成为他人羡慕的典范。',
'["安全型","平衡","成熟","信任"]', 2),

('love-possessiveness', 56, 70, '中等偏高·焦虑型 ⭐⭐⭐⭐',
'你的占有欲处于中等偏高水平，倾向于焦虑型依恋。你对关系投入很深，但也容易因不安全感产生控制欲和过度关注。

【表现特征】
• 需要频繁的确认和回应
• 对伴侣的社交较为敏感
• 容易因小事产生焦虑和猜疑
• 希望伴侣把你放在优先位置

【影响】
这种程度的占有欲可能给关系带来压力，伴侣可能感到被监控或不被信任，长期可能导致关系紧张。

【改善建议】
• 识别焦虑来源，建立内在安全感
• 学会区分"想要"和"需要"
• 培养独立的兴趣和社交圈
• 练习延迟回应焦虑的冲动
• 考虑通过心理咨询探索依恋模式',
'["焦虑型","敏感","需要确认","控制倾向"]', 3),

('love-possessiveness', 71, 85, '高占有欲·控制型 ⭐⭐⭐⭐⭐',
'警示：你的占有欲已达到较高水平，表现出明显的控制型特征。这种模式可能严重影响关系质量和伴侣的身心健康。

【危险信号】
• 要求掌控伴侣的行踪和社交
• 频繁查看手机或监控行为
• 限制伴侣的个人空间和自由
• 强烈的嫉妒和不安全感
• 难以容忍伴侣的独立性

【关系影响】
这种程度的占有欲会让伴侣感到窒息和压抑，可能导致：关系破裂、伴侣心理问题、自己陷入焦虑循环。

【紧急建议】
• 强烈建议寻求专业心理咨询
• 学习健康的依恋模式
• 探索童年经历对当前关系的影响
• 暂停做重大关系决定
• 培养自我价值感和独立性

记住：真正的爱是给予自由，而非施加控制。',
'["控制型","高焦虑","不安全感","需要帮助"]', 4),

('love-possessiveness', 86, 100, '极高占有欲·需要专业帮助 ⚠️',
'严重警示：你的占有欲已达到极高水平，这不仅会摧毁关系，也可能对你和伴侣造成严重的心理伤害。

【严重表现】
• 极端的控制欲和监控行为
• 无法容忍任何独立空间
• 频繁的情绪爆发和冲突
• 可能出现威胁或强迫行为
• 将伴侣视为私有财产

【危险后果】
• 关系中的情感虐待
• 伴侣可能出现抑郁、焦虑等心理问题
• 自己陷入极度痛苦和失控
• 可能升级为更严重的行为问题

【必要行动】
⚠️ 请立即寻求专业心理治疗
⚠️ 这不是性格问题，而是需要专业干预的心理状态
⚠️ 建议暂停恋爱关系，先处理个人议题
⚠️ 探索创伤经历和依恋障碍
⚠️ 学习情绪调节和健康关系模式

改变是可能的，但需要你承认问题并主动寻求帮助。为了你和爱人的幸福，请勇敢迈出第一步。',
'["极高风险","需要治疗","控制狂","情感虐待倾向"]', 5);
