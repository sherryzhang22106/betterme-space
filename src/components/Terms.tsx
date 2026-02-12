import React from 'react';

export type TermType = 'service' | 'privacy' | 'disclaimer';

interface TermsProps {
  type: TermType;
  onBack: () => void;
}

const Terms: React.FC<TermsProps> = ({ type, onBack }) => {
  const content = {
    service: {
      title: "服务协议",
      lastUpdated: "2024年10月24日",
      sections: [
        { heading: "1. 服务性质", text: "BetterMe Space（以下简称"本平台"）提供的服务包括但不限于性格行为测评、内在状态分析及 AI 认知导向建议。本服务仅供个人自我认知探索及娱乐参考之用，旨在帮助用户了解自身性格特质。" },
        { heading: "2. 非医疗/心理干预声明", text: "用户知悉并同意：本平台提供的所有报告、建议及 AI 对话内容不代表医疗建议、性格缺陷诊断或心理咨询服务。本平台不具备医疗资质，不提供任何形式的临床心理诊断或危机干预。若用户感到明显的精神不适或有自残/伤害他人倾向，请务必向专业的医疗机构寻求帮助。" },
        { heading: "3. 用户行为规范", text: "用户应确保提供的信息真实、客观。禁止利用本平台传播违反法律法规的内容。用户对通过本平台生成的内容及其后续行为承担全部责任。" },
        { heading: "4. 知识产权", text: "本平台的所有测评量表逻辑、UI设计、AI 建议算法均受到知识产权保护。未经许可，禁止任何商业性质的采集或二次开发。" }
      ]
    },
    privacy: {
      title: "隐私政策",
      lastUpdated: "2024年10月24日",
      sections: [
        { heading: "1. 信息收集", text: "我们仅收集为您提供性格分析所必需的信息，包括：测评选择项、AI 互动文本、设备型号及基础位置信息（用于适配区域环境）。我们绝不收集任何医疗病历或法律禁止采集的敏感生物识别数据。" },
        { heading: "2. 信息存储与加密", text: "您的个人数据将通过端到端加密（End-to-End Encryption）技术存储。我们采用工业级防火墙和动态脱敏技术，确保您的内在探索历程仅对您个人可见。" },
        { heading: "3. 信息共享", text: "我们承诺不会向任何第三方出售您的数据。除非法律强制要求，否则我们不会向任何非关联实体披露您的测评详情。" },
        { heading: "4. 您的权利", text: "您可以随时要求注销账户并彻底删除您的性格数据历史。注销后，所有数据将从我们的服务器中永久擦除且不可恢复。" }
      ]
    },
    disclaimer: {
      title: "免责声明",
      lastUpdated: "2024年10月24日",
      sections: [
        { heading: "1. 结果准确性说明", text: "BetterMe Space 提供的测评结果基于性格行为学统计模型和 AI 概率推算。由于性格的复杂性与动态变化，测评结果可能与实际情况存在偏差。结果仅供参考，不作为人生决策的唯一依据。" },
        { heading: "2. 法律效力声明", text: "本平台提供的报告不具备法律、财务或医疗层面的正式效力。对于用户因依据本平台测评结果而进行的商业决策、情感选择或行为变动，本平台及其运营方均不承担法律责任。" },
        { heading: "3. AI 交互风险", text: "本平台内嵌的"小觅"AI 建议基于大型语言模型生成，尽管我们进行了认知过滤，但 AI 仍可能产生具有局限性或偏见的回答。用户需独立判断其适用性。" },
        { heading: "4. 不适提醒", text: "若测评题目引起您的情绪波动或不适，建议立即停止测试并休息。我们提倡在放松且清醒的状态下进行内在对话。" }
      ]
    }
  };

  const activeContent = content[type];

  return (
    <div className="pt-32 pb-24 min-h-screen bg-slate-50/30">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <button onClick={onBack} className="group flex items-center text-slate-400 hover:text-brand-primary transition-colors mb-12">
          <svg className="w-5 h-5 mr-2 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          返回实验室首页
        </button>

        <div className="bg-white rounded-[3rem] p-8 md:p-16 shadow-xl border border-slate-100">
          <div className="flex items-center space-x-4 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-brand-primary/10 flex items-center justify-center text-brand-primary">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-900">{activeContent.title}</h1>
              <p className="text-sm text-slate-400 font-medium">最后更新日期：{activeContent.lastUpdated}</p>
            </div>
          </div>

          <div className="space-y-12">
            {activeContent.sections.map((section, idx) => (
              <div key={idx} className="space-y-4">
                <h2 className="text-xl font-bold text-slate-800 flex items-center">
                  <span className="w-6 h-6 rounded-lg bg-slate-100 text-slate-400 text-xs flex items-center justify-center mr-3 font-black">{idx + 1}</span>
                  {section.heading}
                </h2>
                <p className="text-slate-600 leading-relaxed text-sm pl-9">{section.text}</p>
              </div>
            ))}
          </div>

          <div className="mt-16 pt-10 border-t border-slate-50">
            <p className="text-center text-xs text-slate-400 font-medium italic">BetterMe Space · 认知与行为实验室 宣</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Terms;
