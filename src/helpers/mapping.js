const petStatus = {
  NONE: 0,
  OPEN: 1,
  ADOPTED: 2,
  OTHER: 3,
  DEAD: -1
};

function statusMapping(title) {
  if (title.includes('已送養') || title.includes('已送出') || title.includes('已去新家') || title.includes('已出養') ||
  title.includes('已認養') || title.includes('已領養') || title.includes('已被') || title.includes('已經找到') ||
  title.includes('結案') || title.includes('目前已去') || title.includes('已有人認養') || title.includes('結束') ||
  title.includes('已找到') || title.includes('已經') || title.includes('已有緣')) return petStatus.ADOPTED;
  else if (title.includes('暫不開放') || title.includes('暫停送養') || title.includes('已被預定')) {
    return petStatus.OTHER;
  }
  return petStatus.OPEN;
}

function areaMapping(area) {
  switch (area) {
    case '台北市':
      return 2;
    case '新北市':
      return 3;
    case '基隆市':
      return 4;
    case '宜蘭縣':
      return 5;
    case '桃園縣':
      return 6;
    case '新竹縣':
      return 7;
    case '新竹市':
      return 8;
    case '苗栗縣':
      return 9;
    case '台中市':
      return 10;
    case '彰化縣':
      return 11;
    case '南投縣':
      return 12;
    case '雲林縣':
      return 13;
    case '嘉義縣':
      return 14;
    case '嘉義市':
      return 15;
    case '台南市':
      return 16;
    case '高雄市':
      return 17;
    case '屏東縣':
      return 18;
    case '花蓮縣':
      return 19;
    case '台東縣':
      return 20;
    case '澎湖縣':
      return 21;
    case '金門縣':
      return 22;
    case '連江縣':
      return 23;
    default:
      throw new Error(`Unknown area: ${area}`);
  }
}

function ageMapping(str) {
  return str.includes('年') ? 1 : 0;
}

function ligationMapping(str) {
  return str.includes('否') ? 0 : 1;
}
module.exports = {
  statusMapping,
  petStatus,
  areaMapping,
  ageMapping,
  ligationMapping
};
