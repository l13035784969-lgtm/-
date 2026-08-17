import { View, Text } from '@tarojs/components';
import './index.scss';

/**
 * 我的 —— 架构文档 2.5 节确认的 Tab 之二。
 * MVP 范围内只放个人信息展示，登录换 openid/JWT 的流程接进来即可，
 * 不是本轮重点，先占好页面位置。
 */
export default function Profile() {
  return (
    <View className="profile-page">
      <View className="avatar-placeholder" />
      <Text className="nickname">未登录</Text>
      <Text className="hint">点击授权登录后展示昵称和头像</Text>
    </View>
  );
}
