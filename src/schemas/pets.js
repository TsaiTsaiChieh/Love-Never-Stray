const { Sequelize } = require('sequelize');
const { mysql } = require('../configs/mysqlSetting');

const Pet = mysql.define('pet', {
  id: { type: Sequelize.INTEGER, allowNull: false, autoIncrement: true, primaryKey: true },
  ref: { type: Sequelize.ENUM, values: ['gov', 'map', 'own'], comment: '資料來源' },
  area_id: { type: Sequelize.INTEGER(4), comment: '所屬縣市代碼' },
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
  image: { type: Sequelize.JSON },
  source_update_time: { type: Sequelize.DATE, comment: '來源的更新時間' },
  source_create_time: { type: Sequelize.DATE, comment: '來源的建立時間' }
});

module.exports = Pet;
