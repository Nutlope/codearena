import LlamaLogo from "@/public/models/llama.png";
import QwenLogo from "@/public/models/qwen.png";
import MoonshotLogo from "@/public/models/kimi-k2.png";
import DeepSeekLogo from "@/public/models/deepseek.png";

export const models = [
  {
    label: "Kimi K2 Instruct",
    shortLabel: "Kimi K2",
    organization: "Moonshot",
    logo: MoonshotLogo,
    apiName: "moonshotai/Kimi-K2-Instruct",
  },
  {
    label: "DeepSeek V3",
    shortLabel: "DeepSeek V3",
    organization: "DeepSeek",
    logo: DeepSeekLogo,
    apiName: "deepseek-ai/DeepSeek-V3",
  },
  {
    label: "Llama 3.3 70B Instruct Turbo",
    shortLabel: "Llama 3.3 70B",
    organization: "Meta",
    logo: LlamaLogo,
    apiName: "meta-llama/Llama-3.3-70B-Instruct-Turbo",
  },
  {
    label: "Llama 3.1 405B Instruct Turbo",
    shortLabel: "Llama 3.1 405B",
    organization: "Meta",
    logo: LlamaLogo,
    apiName: "meta-llama/Meta-Llama-3.1-405B-Instruct-Turbo",
  },
  {
    label: "Qwen 3 Coder 480B",
    shortLabel: "Qwen 3 Coder",
    organization: "Qwen",
    logo: QwenLogo,
    apiName: "Qwen/Qwen3-Coder-480B-A35B-Instruct-FP8",
  },
  {
    label: "Qwen 2.5 72B Instruct Turbo",
    shortLabel: "Qwen 2.5 72B",
    organization: "Qwen",
    logo: QwenLogo,
    apiName: "Qwen/Qwen2.5-72B-Instruct-Turbo",
  },
];
