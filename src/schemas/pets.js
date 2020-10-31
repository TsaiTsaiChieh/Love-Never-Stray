const { Sequelize } = require('sequelize');
const { mysql } = require('../configs/mysqlSetting');

const Pet = mysql.define('pet', {
  id: { type: Sequelize.INTEGER, allowNull: false, autoIncrement: true, primaryKey: true },
  name: { type: Sequelize.STRING(128), comment: '寵物名' },
  ref: { type: Sequelize.ENUM, values: ['gov', 'map', 'own'], comment: '資料來源' },
  area_id: { type: Sequelize.INTEGER(4), comment: '所屬縣市代碼：2 臺北市 / 3 新北市 / 4 基隆市 / 5 宜蘭縣 / 6 桃園縣 / 7 新竹縣 / 8 新竹市 / 9 苗栗縣 / 10 臺中市 / 11 彰化縣 / 12 南投縣 / 13 雲林縣 / 14 嘉義縣 / 15 嘉義市 / 16 臺南市 / 17 高雄市 / 18 屏東縣 / 19 花蓮縣 / 20 臺東縣 / 21 澎湖縣 / 22 金門縣 / 23 連江縣' },
  kind: { type: Sequelize.STRING(16), comment: '寵物種類' },
  sex: { type: Sequelize.INTEGER(4), defaultValue: -1, comment: '-1 未知 / 0 母 / 1 公' },
  color: { type: Sequelize.STRING(8) },
  age: { type: Sequelize.INTEGER(4), defaultValue: -1, comment: '-1 未知 / 0 幼體 / 1 成體' },
  ligation: { type: Sequelize.INTEGER(4), defaultValue: -1, comment: '-1 / 未知 / 0 未結紮 / 1 結紮 ' },
  rabies: { type: Sequelize.INTEGER(4), defaultValue: -1, comment: '狂犬病疫苗：-1 未知 / 0 未施打 / 1 已施打' },
  found_place: { type: Sequelize.STRING, comment: '尋獲地（文字描述）' },
  title: { type: Sequelize.STRING, comment: '寵物文章標題' },
  status: { type: Sequelize.INTEGER(4), defaultValue: 0, comment: '寵物狀態：0 無 / 1 開放 / 2 已被認養 / 3 其他 / -1 死亡' },
  remark: { type: Sequelize.STRING, comment: '資料備註（文字描述）' },
  address: { type: Sequelize.STRING },
  phone: { type: Sequelize.STRING(16) },
  image: { type: Sequelize.JSON }
},
{
  indexes: [{ fields: ['ref'] }, { fields: ['kind', 'age', 'sex', 'area_id'] }]

});

const Region = mysql.define('region', {
  id: { type: Sequelize.INTEGER, allowNull: false, autoIncrement: true, primaryKey: true },
  region: { type: Sequelize.ENUM('N', 'M', 'S', 'E', 'O'), allowNull: false, comment: 'N 北 / M 中 / S 南 / E 東 / O 外島 ' },
  fk_area_id: {
    type: Sequelize.INTEGER(4),
    allowNull: false,
    references: {
      model: 'pets',
      key: 'area_id'
    },
    onUpdate: 'CASCADE', // 將有所關聯的紀錄行進行刪除或修改
    onDelete: 'CASCADE', // 有存在的關聯紀錄行時，會禁止父資料表的刪除或修改動作
    comment: '所屬縣市代碼'
  }

},
{
  timestamps: false,

  indexes: [{ fields: ['region_id'] }]
});

module.exports = { Pet, Region };
