import Taro from '@tarojs/taro';

/**
 * 地点选择/导航 —— 架构文档 2.1 节已确认：全用微信原生免费能力，
 * 不接腾讯位置服务的付费 WebService API。
 */
export interface ChosenLocation {
  name: string;
  address: string;
  latitude: number;
  longitude: number;
}

/** 添加行程项时选点，微信原生选点器（免费，见 1.2 第2项） */
export async function chooseLocation(): Promise<ChosenLocation | null> {
  try {
    const res = await Taro.chooseLocation();
    return {
      name: res.name || res.address,
      address: res.address,
      latitude: res.latitude,
      longitude: res.longitude,
    };
  } catch {
    // 用户取消选点，不算错误
    return null;
  }
}

/** 每个行程项的"导航"按钮，跳转微信内置地图（免费，1.2 节已确认拉回 MVP） */
export function openLocation(point: ChosenLocation): void {
  Taro.openLocation({
    latitude: point.latitude,
    longitude: point.longitude,
    name: point.name,
    address: point.address,
  });
}
