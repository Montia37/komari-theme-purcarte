// 配置类型定义
export interface ConfigOptions {
  backgroundImage?: string; // 背景图片URL
  tagDefaultColorList?: string; // 标签默认颜色列表
  enableLogo?: boolean; // 是否启用Logo
  logoUrl?: string; // Logo图片URL
  enableTitle?: boolean; // 是否启用标题
  titleText?: string; // 标题文本
  enableSearchButton?: boolean; // 是否启用搜索按钮
  selectedDefaultView?: "grid" | "table"; // 默认视图模式
  selectedDefaultAppearance?: "light" | "dark" | "system"; // 默认外观模式
  enableAdminButton?: boolean; // 是否启用管理员按钮
  enableStatsBar?: boolean; // 是否启用统计栏
  enableGroupedBar?: boolean; // 是否启用分组栏
  enableInstanceDetail?: boolean; // 是否启用实例详情
  enablePingChart?: boolean; // 是否启用延迟图表
  pingChartMaxPoints?: number; // 延迟图表最大点数
  enableSwap?: boolean; // 是否启用SWAP显示
}

// 默认配置值
export const DEFAULT_CONFIG: ConfigOptions = {
  backgroundImage: "/assets/Moonlit-Scenery.webp",
  tagDefaultColorList:
    "ruby,gray,gold,bronze,brown,yellow,amber,orange,tomato,red,crimson,pink,plum,purple,violet,iris,indigo,blue,cyan,teal,jade,green,grass,lime,mint,sky",
  enableLogo: false,
  logoUrl: "/assets/logo.png",
  enableTitle: true,
  titleText: "Komari",
  enableSearchButton: true,
  selectedDefaultView: "grid",
  selectedDefaultAppearance: "system",
  enableAdminButton: true,
  enableStatsBar: true,
  enableGroupedBar: true,
  enableInstanceDetail: true,
  enablePingChart: true,
  pingChartMaxPoints: 0,
  enableSwap: true,
};
