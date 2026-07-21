export interface StoreLocation {
  id: string;
  name: string;
  city: string;
  address: string;
  phone: string;
  hours: string;
  longitude: number;
  latitude: number;
}

export const storeLocations: StoreLocation[] = [
  {
    id: "s1",
    name: "蟹礼 · 北京国贸旗舰店",
    city: "北京",
    address: "朝阳区建国门外大街1号国贸商城 L121",
    phone: "010-6505-1288",
    hours: "10:00 - 22:00",
    longitude: 116.4614,
    latitude: 39.9087,
  },
  {
    id: "s2",
    name: "蟹礼 · 上海恒隆精品店",
    city: "上海",
    address: "静安区南京西路1266号恒隆广场 205",
    phone: "021-6289-7888",
    hours: "10:00 - 22:00",
    longitude: 121.4496,
    latitude: 31.2304,
  },
  {
    id: "s3",
    name: "蟹礼 · 成都太古里店",
    city: "成都",
    address: "锦江区中纱帽街8号成都太古里 2栋1106",
    phone: "028-8651-2888",
    hours: "10:00 - 22:00",
    longitude: 104.0883,
    latitude: 30.6572,
  },
  {
    id: "s4",
    name: "蟹礼 · 深圳万象城店",
    city: "深圳",
    address: "罗湖区宝安南路1881号万象城 L146",
    phone: "0755-2266-3888",
    hours: "10:00 - 22:00",
    longitude: 114.1008,
    latitude: 22.5463,
  },
  {
    id: "s5",
    name: "蟹礼 · 南京德基店",
    city: "南京",
    address: "中山路18号德基广场一期 L132",
    phone: "025-8473-2888",
    hours: "10:00 - 22:00",
    longitude: 118.7856,
    latitude: 32.0508,
  },
  {
    id: "s6",
    name: "蟹礼 · 杭州大厦店",
    city: "杭州",
    address: "下城区武林广场21号杭州大厦 B1F",
    phone: "0571-8706-2888",
    hours: "10:00 - 22:00",
    longitude: 120.1694,
    latitude: 30.2741,
  },
];

export const cityGroups = storeLocations.reduce<Record<string, StoreLocation[]>>(
  (acc, store) => {
    if (!acc[store.city]) acc[store.city] = [];
    acc[store.city].push(store);
    return acc;
  },
  {}
);
