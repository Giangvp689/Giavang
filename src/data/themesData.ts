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
    name: 'Tết & Tiền Vàng Rơi',
    seasonName: 'Tết Cổ Truyền • Đón Lộc Đầu Năm',
    subtitle: 'Tiền vàng & Kim Nguyên Bảo 9999 rơi, liễn câu đối đỏ vàng uy nghi',
    icon: '🧧',
    sloganTag: 'CHÚC MỪNG NĂM MỚI • TẤN TÀI TẤN LỘC • VẠN SỰ NHƯ Ý',
    fallingType: 'gold_money_falling',
    primaryColor: '#dc2626',
    badgeBg: 'bg-red-700 text-amber-200 border border-amber-400/50',
    badgeText: 'Tết Giáp Thìn / Ất Tỵ',
    borderAccent: 'border-amber-400',
    tagline: 'Đồng tiền vàng 3D & thỏi Kim Nguyên Bảo rơi cùng hoa đào hoa mai',
    description: 'Bầu không khí Tết Việt Nam rực rỡ với liễn câu đối đỏ vàng "Năm mới hạnh phúc bình an đến / Ngày xuân vinh hoa phú quý về", thỏi vàng Kim Nguyên Bảo 9999 và đồng tiền xu vàng may mắn xoay 3D rơi lả tả cùng pháo hoa mini.',
    effectDescription: 'Tiền vàng & Kim Nguyên Bảo 3D rơi, liễn câu đối thư pháp Tết đỏ vàng'
  },
  {
    id: 'spring',
    name: 'Mùa Xuân & Trúc Xanh',
    seasonName: 'Xuân Trúc Non • Xanh Lá Tre & Trắng Sang Trọng',
    subtitle: 'Sắc xanh lá tre non kết hợp trắng tinh khôi, đàn én chao liệng thanh tao',
    icon: '🎋',
    sloganTag: 'MÙA XUÂN PHỒN VINH • TÀI LỘC ĐÂM CHỒI • VẠN ĐIỀU MAY MẮN',
    fallingType: 'spring_swallows',
    primaryColor: '#16a34a',
    badgeBg: 'bg-emerald-100 text-emerald-800 border border-emerald-300',
    badgeText: 'Xanh Lá Tre & Trắng',
    borderAccent: 'border-emerald-400',
    tagline: 'Sắc xanh lá tre nhạt thanh nhã & đàn én mùa xuân chao liệng',
    description: 'Tone màu xanh lá tre non thanh nhã kết hợp sắc trắng ngọc tinh khôi, phong cách nhạt quý phái, đàn én sải cánh chao liệng cùng lá tre thanh khiết tạo nên sự sang trọng đỉnh cao.',
    effectDescription: 'Đàn én sải cánh chao lượn, lá tre non phất phơ & cánh hoa xuân thanh khiết'
  },
  {
    id: 'summer',
    name: 'Mùa Hè & Ánh Nắng Chiếu',
    seasonName: 'Hạ Sang Kim Sắc • Nắng Vàng & Mát Lành',
    subtitle: 'Tia nắng rạng rỡ chiếu xiên, hạt nắng vàng óng & bong bóng mát lạnh',
    icon: '☀️',
    sloganTag: 'RỰC RỠ MÙA HÈ • NĂNG ĐỘNG KHỞI SẮC • ĐẠI CÁT ĐẠI LỢI',
    fallingType: 'summer_sunrays',
    primaryColor: '#0284c7',
    badgeBg: 'bg-sky-700 text-amber-200 border border-amber-300/50',
    badgeText: 'Hạ Sang Rực Rỡ',
    borderAccent: 'border-amber-400',
    tagline: 'Luồng ánh nắng vàng chiếu rọi & bong bóng nước mát rượi',
    description: 'Những luồng tia nắng sớm rực rỡ (God rays) chiếu xiên ấm áp từ góc trên cao, hạt bụi nắng vàng óng nhảy múa cùng bong bóng nước pha lê bay lên mang cảm giác mát mẻ sảng khoái.',
    effectDescription: 'Tia nắng vàng chiếu rọi, hạt bụi nắng óng ánh & bong bóng pha lê mát dịu'
  },
  {
    id: 'autumn',
    name: 'Mùa Thu & Gió Lá Vàng Rơi',
    seasonName: 'Thu Vàng Quý Phái • Gió Heo May',
    subtitle: 'Làn gió heo may uốn lượn cuốn lá phong đỏ & lá ngân hạnh chao liệng',
    icon: '🍂',
    sloganTag: 'MÙA THU VÀNG • BÌNH AN THỊNH VƯỢNG • PHÚ QUÝ TRƯỜNG TỒN',
    fallingType: 'autumn_wind_leaves',
    primaryColor: '#b45309',
    badgeBg: 'bg-amber-700 text-amber-100 border border-amber-400/50',
    badgeText: 'Thu Vàng Quý Tộc',
    borderAccent: 'border-amber-500',
    tagline: 'Gió thu cuốn lá phong đỏ cam & lá ngân hạnh vàng xoáy rơi',
    description: 'Ngọn gió heo may mùa thu thổi ngang uốn lượn, cuốn những chiếc lá phong đỏ rực, lá ngân hạnh vàng óng (Ginkgo) chao liệng cuộn xoáy trong gió lãng mạn quý phái.',
    effectDescription: 'Gió heo may thổi cuốn lá phong đỏ cam & lá ngân hạnh vàng xoay rơi'
  },
  {
    id: 'winter',
    name: 'Mùa Đông & Tuyết Lạnh',
    seasonName: 'Đông Sang Tinh Khôi • Tuyết Pha Lê',
    subtitle: 'Tuyết trắng đa tầng rơi lất phất, bông tuyết pha lê 6 cánh xoay tròn',
    icon: '❄️',
    sloganTag: 'MÙA ĐÔNG AN LÀNH • GIÁNG SINH PHƯỚC LỘC • ẤM ÁP SUM VẦY',
    fallingType: 'winter_snow_crystals',
    primaryColor: '#2563eb',
    badgeBg: 'bg-blue-800 text-blue-100 border border-blue-400/50',
    badgeText: 'Tuyết Rơi Lung Linh',
    borderAccent: 'border-sky-300',
    tagline: 'Bông tuyết pha lê 6 cánh xoay tròn & viền băng sương tinh khôi',
    description: 'Tuyết trắng rơi đa tầng lãng mạn dày dặn, những bông hoa tuyết pha lê 6 cánh tinh xảo phát sáng xoay tròn rơi nhẹ nhàng cùng viền băng tuyết đọng tinh khôi.',
    effectDescription: 'Tuyết trắng rơi đa tầng, bông tuyết pha lê 6 cánh xoay tròn & viền băng giá'
  },
  {
    id: 'luxury',
    name: 'Hoàng Kim Sang Trọng',
    seasonName: 'Kim Sắc Hoàng Gia • Đẳng Cấp 24K',
    subtitle: 'Mưa bụi vàng 24K dát vàng màn hình & sao kim cương tỏa rạng',
    icon: '✨',
    sloganTag: 'CHỮ TÍN QUÝ HƠN VÀNG • BẢO TOÀN GIÁ TRỊ • ĐẲNG CẤP VĨNH CỬU',
    fallingType: 'gold_dust_cascade',
    primaryColor: '#b91c1c',
    badgeBg: 'bg-yellow-600 text-yellow-950 border border-yellow-300',
    badgeText: 'Đẳng Cấp Hoàng Gia',
    borderAccent: 'border-yellow-400',
    tagline: 'Mưa bụi vàng ròng 24K lấp lánh & quầng sáng bokeh hoàng tộc',
    description: 'Mưa bụi vàng ròng 24K rơi óng ánh dát vàng màn hình, kết hợp quầng sáng bokeh vàng lơ lửng và sao kim cương tỏa rạng tạo nên đẳng cấp tiệm vàng hoàng gia xa hoa.',
    effectDescription: 'Mưa bụi vàng ròng 24K rơi lấp lánh, quầng sáng bokeh & sao kim cương'
  }
];

export function getThemeById(themeId?: string): TvThemeDefinition {
  const found = TV_THEMES.find(t => t.id === themeId);
  return found || TV_THEMES[0];
}
