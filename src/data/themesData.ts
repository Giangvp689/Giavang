import { TvThemeDefinition, TvThemeId } from '../types';

export const TV_THEMES: TvThemeDefinition[] = [
  {
    id: 'none',
    name: 'Mặc Định (Để Nguyên)',
    seasonName: 'Nguyên Bản / Tối Giản',
    subtitle: 'Bảng giá gốc sạch sẽ, truyền thống không hiệu ứng',
    icon: '⚜️',
    sloganTag: 'CHỮ TÍN QUÝ HƠN VÀNG • TẬN TÂM PHỤC VỤ',
    fallingType: 'none',
    primaryColor: '#b91c1c',
    badgeBg: 'bg-emerald-50 text-emerald-800 border border-emerald-300',
    badgeText: 'SJC • PNJ • DOJI',
    borderAccent: 'border-amber-400',
    tagline: 'Giữ nguyên vẹn bảng giá truyền thống, tĩnh 100%',
    description: 'Không có hoa cành góc TV và không có hiệu ứng chuyển động, giữ nguyên bản bảng giá tiệm vàng chuẩn mực, thanh lịch và tĩnh lặng 100%.',
    effectDescription: 'Để nguyên 100%, không hiệu ứng chuyển động & không hoa cành góc'
  },
  {
    id: 'tet',
    name: 'Tết & Năm Mới',
    seasonName: 'Tết Nguyên Đán',
    subtitle: 'Pháo hoa mini nở nhẹ, cành đào hồng mai vàng đón lộc',
    icon: '🌸',
    sloganTag: 'CHÚC MỪNG NĂM MỚI • VẠN SỰ NHƯ Ý • TẤN TÀI TẤN LỘC',
    fallingType: 'peach_fireworks',
    primaryColor: '#dc2626',
    badgeBg: 'bg-red-700 text-amber-200 border border-amber-400/50',
    badgeText: 'Tết Giáp Thìn / Ất Tỵ',
    borderAccent: 'border-amber-400',
    tagline: 'Pháo bông nở chùm lấp lánh & cành đào mai tài lộc',
    description: 'Các chùm pháo hoa que mini lấp lánh nở nhẹ nhàng tỏa ra các tia sáng vàng đỏ mừng xuân, cùng cành đào hồng, cành mai vàng và lồng đèn tài lộc góc TV.',
    effectDescription: 'Chùm pháo hoa mini nở nhẹ tỏa tia sáng vàng đỏ lung linh mừng xuân'
  },
  {
    id: 'spring',
    name: 'Mùa Xuân',
    seasonName: 'Xuân Tài Lộc',
    subtitle: 'Đàn bướm xuân vỗ cánh bay lượn, lộc non đâm chồi',
    icon: '🌿',
    sloganTag: 'MÙA XUÂN PHỒN VINH • TÀI LỘC ĐÂM CHỒI • VẠN ĐIỀU MAY MẮN',
    fallingType: 'spring_butterflies',
    primaryColor: '#059669',
    badgeBg: 'bg-emerald-700 text-emerald-100 border border-emerald-400/50',
    badgeText: 'Xuân Đâm Chồi',
    borderAccent: 'border-emerald-400',
    tagline: 'Đàn bướm vàng bướm hoa dập dờn bay lượn',
    description: 'Những chú bướm xuân xinh xắn vỗ cánh dập dờn lướt sóng bay lượn mềm mại qua màn hình cùng bụi phấn hoa phát sáng, mang biểu tượng sinh sôi và tài lộc.',
    effectDescription: 'Đàn bướm xuân vỗ cánh bay lượn dập dờn khắp màn hình'
  },
  {
    id: 'summer',
    name: 'Mùa Hè',
    seasonName: 'Hạ Sang Kim Sắc',
    subtitle: 'Đom đóm dạ quang phát sáng & bong bóng bay từ dưới lên',
    icon: '☀️',
    sloganTag: 'RỰC RỠ MÙA HÈ • NĂNG ĐỘNG KHỞI SẮC • ĐẠI CÁT ĐẠI LỢI',
    fallingType: 'summer_fireflies',
    primaryColor: '#ea580c',
    badgeBg: 'bg-amber-600 text-amber-50 border border-amber-300/50',
    badgeText: 'Hạ Sang Rực Rỡ',
    borderAccent: 'border-amber-400',
    tagline: 'Đom đóm phát quang & bong bóng bồng bềnh bay lên',
    description: 'Các hạt đom đóm dạ quang phát sáng êm dịu nhấp nháy cùng những hạt bong bóng ánh kim bồng bềnh bay từ DƯỚI LÊN TRÊN, mang lại cảm giác mát mẻ và huyền ảo.',
    effectDescription: 'Đom đóm dạ quang & bong bóng ánh kim bay từ DƯỚI LÊN TRÊN'
  },
  {
    id: 'autumn',
    name: 'Mùa Thu',
    seasonName: 'Thu Vàng Quý Phái',
    subtitle: 'Gió heo may thổi ngang cuốn lá phong lượn sóng',
    icon: '🍂',
    sloganTag: 'MÙA THU VÀNG • BÌNH AN THỊNH VƯỢNG • PHÚ QUÝ TRƯỜNG TỒN',
    fallingType: 'autumn_breeze',
    primaryColor: '#b45309',
    badgeBg: 'bg-amber-700 text-amber-100 border border-amber-400/50',
    badgeText: 'Thu Vàng Quý Tộc',
    borderAccent: 'border-amber-500',
    tagline: 'Gió thu cuốn lá phong vàng hổ phách bay ngang',
    description: 'Ngọn gió heo may mùa thu thổi ngang nhẹ nhàng, cuốn những chiếc lá phong mật ong và lá hổ phách lướt sóng chao nghiêng từ trái sang phải đầy thơ mộng.',
    effectDescription: 'Gió heo may thổi ngang cuốn lá phong lướt sóng chao nghiêng'
  },
  {
    id: 'winter',
    name: 'Mùa Đông',
    seasonName: 'Mùa Đông & Giáng Sinh',
    subtitle: 'Bông tuyết pha lê rơi cực chậm xoay êm đềm',
    icon: '❄️',
    sloganTag: 'MÙA ĐÔNG AN LÀNH • GIÁNG SINH PHƯỚC LỘC • ẤM ÁP SUM VẦY',
    fallingType: 'winter_snow',
    primaryColor: '#2563eb',
    badgeBg: 'bg-blue-800 text-blue-100 border border-blue-400/50',
    badgeText: 'Tuyết Rơi Lung Linh',
    borderAccent: 'border-sky-300',
    tagline: 'Bông tuyết pha lê 6 cánh tinh khôi xoay tròn rơi chậm',
    description: 'Những bông tuyết pha lê 6 cánh tinh xảo và hạt băng óng ánh xoay tròn rơi rất chậm rãi và êm đềm như khung cảnh mùa đông thanh bình.',
    effectDescription: 'Bông tuyết pha lê 6 cánh xoay tròn rơi cực kỳ chậm rãi'
  },
  {
    id: 'luxury',
    name: 'Hoàng Kim Sang Trọng',
    seasonName: 'Kim Sắc Hoàng Gia',
    subtitle: 'Đốm sáng Bokeh vàng óng & ánh sao lấp lánh tại chỗ',
    icon: '✨',
    sloganTag: 'CHỮ TÍN QUÝ HƠN VÀNG • BẢO TOÀN GIÁ TRỊ • ĐẲNG CẤP VĨNH CỬU',
    fallingType: 'gold_bokeh',
    primaryColor: '#b91c1c',
    badgeBg: 'bg-yellow-600 text-yellow-950 border border-yellow-300',
    badgeText: 'Đẳng Cấp Hoàng Gia',
    borderAccent: 'border-yellow-400',
    tagline: 'Quầng sáng Bokeh vàng óng & sao kim cương tỏa rạng',
    description: 'Không chuyển động rơi: Các quầng sáng Bokeh vàng óng lơ lửng bồng bềnh tại chỗ, to nhỏ nhấp nháy nhịp nhàng cùng ngôi sao kim cương lấp lánh như ánh đèn chiếu tủ trang sức cao cấp.',
    effectDescription: 'Quầng sáng Bokeh vàng óng lơ lửng & sao kim cương tỏa rạng tại chỗ'
  }
];

export function getThemeById(themeId?: string): TvThemeDefinition {
  const found = TV_THEMES.find(t => t.id === themeId);
  return found || TV_THEMES[0];
}
