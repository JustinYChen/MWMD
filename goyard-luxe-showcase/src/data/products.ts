export interface Product {
  id: string;
  name: string;
  nameZh: string;
  category: string;
  description: string;
  imageUrl: string;
  price?: string;
}

export const products: Product[] = [
  {
    id: "1",
    name: "Saint Louis Tote",
    nameZh: "圣路易手提袋",
    category: "bags",
    description: "标志性 Goyardine 帆布制成的经典手提袋，轻盈耐用，是 Maison Goyard 最为人熟知的作品。",
    imageUrl: "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=luxury%20beige%20canvas%20tote%20bag%20with%20subtle%20chevron%20pattern%20on%20warm%20cream%20background%2C%20elegant%20minimal%20product%20photography%2C%20soft%20studio%20lighting%2C%20high%20end%20fashion&image_size=portrait_4_3",
  },
  {
    id: "2",
    name: "Artois Tote",
    nameZh: "阿图瓦手提袋",
    category: "bags",
    description: "以 Goyardine 帆布与皮革饰边打造，结构更为硬挺，兼具优雅与实用。",
    imageUrl: "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=luxury%20structured%20tote%20bag%20in%20warm%20tan%20leather%20and%20beige%20canvas%2C%20minimal%20product%20photography%2C%20cream%20background%2C%20soft%20natural%20lighting%2C%20high%20fashion&image_size=portrait_4_3",
  },
  {
    id: "3",
    name: "Anjou Tote",
    nameZh: "安茹手提袋",
    category: "bags",
    description: "双面可用的设计，一面为 Goyardine 帆布，另一面为纯色皮革，两种风格随心切换。",
    imageUrl: "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=reversible%20luxury%20bag%20beige%20canvas%20and%20burgundy%20leather%2C%20elegant%20product%20photography%2C%20warm%20cream%20background%2C%20soft%20lighting%2C%20minimalist&image_size=portrait_4_3",
  },
  {
    id: "4",
    name: "Bellechasse",
    nameZh: "贝莱夏斯包",
    category: "bags",
    description: "以巴黎左岸街区命名，线条简洁流畅，是都市日常的完美伴侣。",
    imageUrl: "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=elegant%20crossbody%20bag%20in%20warm%20brown%20leather%20with%20gold%20hardware%2C%20minimal%20product%20photography%2C%20cream%20background%2C%20luxury%20fashion&image_size=portrait_4_3",
  },
  {
    id: "5",
    name: "Chemin",
    nameZh: "谢曼包",
    category: "bags",
    description: "灵感源自旅行箱的包型设计，融合传统工艺与现代美学。",
    imageUrl: "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=luxury%20mini%20trunk%20bag%20beige%20canvas%20with%20dark%20brown%20leather%20trim%2C%20product%20photography%2C%20cream%20background%2C%20elegant%20minimal&image_size=portrait_4_3",
  },
  {
    id: "6",
    name: "Ambassade",
    nameZh: "大使公文包",
    category: "bags",
    description: "为现代绅士设计的公文包，以精湛工艺诠释商务优雅。",
    imageUrl: "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=luxury%20briefcase%20in%20dark%20brown%20leather%20with%20gold%20clasp%2C%20minimal%20product%20photography%2C%20warm%20cream%20background%2C%20gentleman%20elegance&image_size=portrait_4_3",
  },
  {
    id: "7",
    name: "Villette",
    nameZh: "维莱特包",
    category: "bags",
    description: "柔软的半月形包身，搭配可调节肩带，随性而不失格调。",
    imageUrl: "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=luxury%20half%20moon%20shaped%20bag%20in%20beige%20canvas%20with%20brown%20leather%20strap%2C%20product%20photography%2C%20cream%20background%2C%20elegant%20minimal&image_size=portrait_4_3",
  },
  {
    id: "8",
    name: "Saïgon",
    nameZh: "西贡包",
    category: "bags",
    description: "以东方都市命名，硬挺的箱型轮廓搭配精致金属扣，复古而摩登。",
    imageUrl: "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=luxury%20structured%20box%20bag%20in%20beige%20canvas%20with%20gold%20hardware%20closure%2C%20minimal%20product%20photography%2C%20cream%20background%2C%20vintage%20modern&image_size=portrait_4_3",
  },
];

export const categories = [
  { id: "all", label: "全部" },
  { id: "bags", label: "包袋" },
  { id: "small-leather", label: "小皮具" },
  { id: "trunks", label: "箱包" },
  { id: "accessories", label: "配饰" },
];
