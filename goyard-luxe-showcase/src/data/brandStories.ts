export interface BrandStory {
  id: string;
  year: number;
  title: string;
  titleZh: string;
  description: string;
  imageUrl: string;
}

export const brandStories: BrandStory[] = [
  {
    id: "1",
    year: 1853,
    title: "The Beginning",
    titleZh: "起源",
    description:
      "Edmond Goyard 在巴黎蒙田大道开设了第一间工坊。彼时，旅行是少数人的特权，而一只精工细作的旅行箱，便是身份与品位的象征。年轻的 Goyard 以对木材与皮革的深刻理解，迅速赢得了巴黎上流社会的青睐。",
    imageUrl:
      "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=antique%20paris%20workshop%20interior%2019th%20century%2C%20warm%20sepia%20tones%2C%20craftsman%20working%20on%20leather%20trunks%2C%20vintage%20atmosphere%2C%20elegant%20minimal&image_size=landscape_16_9",
  },
  {
    id: "2",
    year: 1892,
    title: "Goyardine Canvas",
    titleZh: "Goyardine 帆布",
    description:
      "Goyardine 涂层帆布问世——这是世界上最早的涂层帆布之一。人字纹图案灵感源自家族徽记中的雪松树，每一笔点绘都由匠人手工完成。这种兼具轻盈与耐用的材质，彻底改变了旅行箱的制造方式，至今仍是品牌最具辨识度的标志。",
    imageUrl:
      "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=close%20up%20of%20chevron%20pattern%20canvas%20texture%20in%20warm%20beige%20and%20brown%20tones%2C%20luxury%20material%20detail%2C%20soft%20lighting%2C%20minimal%20elegant&image_size=landscape_16_9",
  },
  {
    id: "3",
    year: 1920,
    title: "Art Deco Era",
    titleZh: "装饰艺术时代",
    description:
      "咆哮的二十年代，Goyard 为欧洲皇室、贵族与好莱坞巨星定制旅行箱。从温莎公爵到可可·香奈儿，每一位品味卓绝的旅行者都以拥有一只 Goyard 旅行箱为荣。品牌将精湛工艺与装饰艺术美学完美融合，成为那个黄金时代的出行标配。",
    imageUrl:
      "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=art%20deco%20era%20luxury%20travel%20trunks%20stacked%2C%20warm%20golden%20tones%2C%20vintage%20luxury%20travel%2C%20elegant%20minimal%20photography&image_size=landscape_16_9",
  },
  {
    id: "4",
    year: 1950,
    title: "Post-War Elegance",
    titleZh: "战后优雅",
    description:
      "战后岁月里，Goyard 延续着对品质的坚守。在工业化浪潮中，品牌始终坚持以手工制作为核心，每一只箱包都经过百余道工序精心打造。这种对传统的执着，让 Goyard 在快速变化的时代中保持了独特的品格。",
    imageUrl:
      "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=1950s%20elegant%20woman%20with%20luxury%20leather%20luggage%20at%20train%20station%2C%20warm%20vintage%20tones%2C%20cinematic%20photography%2C%20nostalgic%20elegance&image_size=landscape_16_9",
  },
  {
    id: "5",
    year: 2003,
    title: "Renaissance",
    titleZh: "复兴",
    description:
      "Maison Goyard 迎来新生。在保留传统工艺的同时，品牌以当代视角重新诠释经典——Saint Louis 手提袋的推出，让 Goyardine 帆布重新走入大众视野。轻盈、耐用、优雅，这只手提袋迅速成为品味人士的标志性选择。",
    imageUrl:
      "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20luxury%20store%20interior%20with%20warm%20lighting%2C%20beige%20and%20gold%20tones%2C%20minimal%20elegant%20display%2C%20high%20end%20boutique&image_size=landscape_16_9",
  },
  {
    id: "6",
    year: 2024,
    title: "Today",
    titleZh: "今日",
    description:
      "从巴黎到东京，从北京到纽约，Maison Goyard 在全球延续着对卓越工艺的执着追求。每一间精品门店都如同品牌的工坊，让来客在宁静优雅的氛围中，感受跨越一个半世纪的匠心传承。每一件作品，都是时间与匠心的见证。",
    imageUrl:
      "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=luxury%20flagship%20store%20facade%20modern%20minimal%2C%20warm%20evening%20lighting%2C%20elegant%20architecture%2C%20beige%20and%20gold%20tones%2C%20high%20end%20fashion&image_size=landscape_16_9",
  },
];

export interface CraftStep {
  id: string;
  step: number;
  title: string;
  titleZh: string;
  description: string;
  imageUrl: string;
}

export const craftSteps: CraftStep[] = [
  {
    id: "c1",
    step: 1,
    title: "Selection",
    titleZh: "选材",
    description:
      "每一块皮革都经过严格筛选。我们的采购师深入法国与意大利的顶级制革厂，只为寻找纹理最细腻、色泽最温润的原材料。Goyardine 帆布的纱线，则来自经过数十年合作的家族工坊。",
    imageUrl:
      "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=premium%20leather%20hides%20on%20wooden%20shelves%2C%20warm%20amber%20lighting%2C%20luxury%20material%20selection%2C%20artisan%20workshop%2C%20elegant%20minimal&image_size=portrait_4_3",
  },
  {
    id: "c2",
    step: 2,
    title: "Painting",
    titleZh: "点绘",
    description:
      "Goyardine 帆布上的人字纹图案，并非印刷，而是由匠人一笔一点手工绘制。这种源自 1892 年的技法，要求每一笔的力度与间距都保持一致。一位熟练的匠人，需要数年训练才能掌握这门技艺。",
    imageUrl:
      "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=artisan%20hand%20painting%20chevron%20pattern%20on%20beige%20canvas%20with%20thin%20brush%2C%20close%20up%20detail%2C%20warm%20golden%20lighting%2C%20luxury%20craftsmanship&image_size=portrait_4_3",
  },
  {
    id: "c3",
    step: 3,
    title: "Cutting",
    titleZh: "裁切",
    description:
      "经验丰富的裁切师沿着皮革的自然纹理，以手工刀片精确裁切每一个部件。这种传统手法虽然缓慢，却能最大程度地保留皮革的天然美感与强度，确保每一件作品的耐用性。",
    imageUrl:
      "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=artisan%20cutting%20leather%20with%20hand%20tool%20on%20cutting%20board%2C%20warm%20workshop%20lighting%2C%20luxury%20leather%20craftsmanship%2C%20elegant%20detail&image_size=portrait_4_3",
  },
  {
    id: "c4",
    step: 4,
    title: "Assembly",
    titleZh: "组装",
    description:
      "缝线、粘合、定型——每一个步骤都需要匠人的全神贯注。Goyard 采用传统的马鞍针法，每一针都穿过预先打好的孔位，确保缝线的均匀与牢固。一只手提袋的组装，往往需要一整天的工时。",
    imageUrl:
      "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=artisan%20hand%20stitching%20leather%20bag%20with%20needle%20and%20thread%2C%20warm%20workshop%20lighting%2C%20saddle%20stitching%20technique%2C%20luxury%20craftsmanship&image_size=portrait_4_3",
  },
];

export interface ArtisanQuote {
  id: string;
  name: string;
  nameZh: string;
  role: string;
  roleZh: string;
  quote: string;
  portraitUrl: string;
}

export const artisanQuotes: ArtisanQuote[] = [
  {
    id: "a1",
    name: "Jean-Pierre Morel",
    nameZh: "让-皮埃尔·莫雷尔",
    role: "Master Painter",
    roleZh: "首席点绘师",
    quote:
      "每一笔点绘都是与历史的对话。当我手持画笔在帆布上描绘人字纹时，我感受到的是一百七十年前那位匠人同样的心跳。这种传承，不是技艺的复制，而是精神的延续。",
    portraitUrl:
      "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=elderly%20french%20artisan%20portrait%2C%20warm%20studio%20lighting%2C%20dignified%20expression%2C%20wearing%20leather%20apron%2C%20elegant%20minimal%20photography&image_size=square_hd",
  },
  {
    id: "a2",
    name: "Marie-Claire Dubois",
    nameZh: "玛丽-克莱尔·杜布瓦",
    role: "Head of Assembly",
    roleZh: "组装工坊主管",
    quote:
      "在我的工坊里，没有捷径。一只包的诞生需要经过百余道工序，每一步都不可省略、不可加速。这不是固执，而是对每一位选择 Goyard 的人的尊重。",
    portraitUrl:
      "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=elegant%20french%20woman%20artisan%20portrait%2C%20warm%20natural%20lighting%2C%20confident%20expression%2C%20wearing%20craftsman%20attire%2C%20minimal%20photography&image_size=square_hd",
  },
];

export interface Store {
  id: string;
  name: string;
  city: string;
  cityZh: string;
  address: string;
  imageUrl: string;
}

export const stores: Store[] = [
  {
    id: "s1",
    name: "Maison Goyard Paris",
    city: "Paris",
    cityZh: "巴黎",
    address: "233 Rue Saint-Honoré, 75001 Paris",
    imageUrl:
      "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=luxury%20boutique%20storefront%20in%20paris%2C%20elegant%20stone%20facade%2C%20warm%20evening%20lighting%2C%20minimal%20architecture%2C%20high%20end%20fashion&image_size=landscape_4_3",
  },
  {
    id: "s2",
    name: "Maison Goyard Tokyo",
    city: "Tokyo",
    cityZh: "东京",
    address: "5-3-1 Ginza, Chuo-ku, Tokyo",
    imageUrl:
      "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=luxury%20boutique%20storefront%20in%20tokyo%20ginza%2C%20modern%20minimal%20facade%2C%20warm%20lighting%2C%20elegant%20architecture%2C%20high%20end%20fashion&image_size=landscape_4_3",
  },
  {
    id: "s3",
    name: "Maison Goyard Beijing",
    city: "Beijing",
    cityZh: "北京",
    address: "国贸商城 L121-L123, 朝阳区建国门外大街1号",
    imageUrl:
      "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=luxury%20boutique%20storefront%20in%20beijing%2C%20modern%20elegant%20facade%2C%20warm%20lighting%2C%20high%20end%20shopping%20mall%2C%20minimal%20architecture&image_size=landscape_4_3",
  },
  {
    id: "s4",
    name: "Maison Goyard Shanghai",
    city: "Shanghai",
    cityZh: "上海",
    address: "国金中心商场 L2-37, 浦东新区世纪大道8号",
    imageUrl:
      "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=luxury%20boutique%20interior%20in%20shanghai%2C%20warm%20ambient%20lighting%2C%20elegant%20display%2C%20beige%20and%20gold%20tones%2C%20high%20end%20fashion&image_size=landscape_4_3",
  },
  {
    id: "s5",
    name: "Maison Goyard New York",
    city: "New York",
    cityZh: "纽约",
    address: "693 Madison Avenue, New York, NY 10065",
    imageUrl:
      "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=luxury%20boutique%20storefront%20on%20madison%20avenue%20new%20york%2C%20elegant%20facade%2C%20warm%20lighting%2C%20high%20end%20fashion%2C%20minimal&image_size=landscape_4_3",
  },
  {
    id: "s6",
    name: "Maison Goyard London",
    city: "London",
    cityZh: "伦敦",
    address: "28 Mount Street, London W1K 2RA",
    imageUrl:
      "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=luxury%20boutique%20storefront%20in%20london%20mayfair%2C%20classic%20british%20architecture%2C%20warm%20lighting%2C%20elegant%20minimal%2C%20high%20end%20fashion&image_size=landscape_4_3",
  },
];
