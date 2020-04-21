const xslx = require("xlsx");
const fs = require("fs");
const _ = require("lodash");

const month = 8;
const SAT = "SAT";
const SUN = "SUN";
const MON = "MON";
const TUE = "TUE";
const WEN = "WEN";
const THU = "THU";
const FRI = "FRI";

const SAT_LIST = [SAT, SUN, MON, TUE, WEN, THU, FRI];
const SUN_LIST = [SUN, MON, TUE, WEN, THU, FRI, SAT];
const MON_LIST = [MON, TUE, WEN, THU, FRI, SAT, SUN];
const TUE_LIST = [TUE, WEN, THU, FRI, SAT, SUN, MON];
const WEN_LIST = [WEN, THU, FRI, SAT, SUN, MON, TUE];
const THU_LIST = [THU, FRI, SAT, SUN, MON, TUE, WEN];
const FRI_LIST = [FRI, SAT, SUN, MON, TUE, WEN, THU];

const WEEK_LIST = {
  12: SAT_LIST,
  11: THU_LIST,
  10: MON_LIST,
  9: SAT_LIST,
  8: WEN_LIST
};
const MAX = { 12: 31, 11: 30, 10: 31, 9: 30, 8: 31 };

const exceptList = {
  12: [25],
  11: [],
  10: [3, 9],
  9: [24, 25, 26],
  8: [15]
};
const targetDate = [];
WEEK_LIST[month].map((l, i) => {
  const start = i + 1;
  const a = [];
  for (let i = 0; i < 5; i++) {
    const date = start + i * 7;
    if (exceptList[month].includes(date) && l !== "SUN") break;
    if (date > MAX[month]) break;
    a.push(`2018.${month}.${date}`);
  }

  if (l === "SUN") {
    exceptList[month].map(c => {
      a.push(`2018.${month}.${c}`);
    });
  }

  targetDate.push({ key: l, list: a });
});

const data = xslx.readFile(`./${month}.xlsx`);
const sheet_name = data.SheetNames;
const xlData = xslx.utils.sheet_to_json(data.Sheets[sheet_name[0]]);

const line = [];

for (let i = 1; i < 9; i++) {
  line.push(`${i}호선`);
}

const time = [
  "05 ~ 06",
  "06 ~ 07",
  "07 ~ 08",
  "08 ~ 09",
  "09 ~ 10",
  "10 ~ 11",
  "11 ~ 12",
  "12 ~ 13",
  "13 ~ 14",
  "14 ~ 15",
  "15 ~ 16",
  "16 ~ 17",
  "17 ~ 18",
  "18 ~ 19",
  "19 ~ 20",
  "20 ~ 21",
  "21 ~ 22",
  "22 ~ 23",
  "23 ~ 24",
  "00 ~ 01"
];

const type = ["승차", "하차"];

const filterData = _.fromPairs(
  line.map(l => {
    const filtered = xlData.filter(x => x.line === l); // 1호선 전체 데이터
    const idList = _.uniq(filtered.map(f => f.id)); // 1호선의 전체 id

    const l_data = _.fromPairs(
      idList.map(id => {
        const data = filtered.filter(f => f.id === id); // 1호선에 동대문인 데이터

        const id_data = _.fromPairs(
          targetDate.map(td => {
            const tdList = td.list;

            const totalData = _.fromPairs(
              type.map(ty => {
                const ty_data = data.filter(d => d.type === ty); // 1호선에 동대문에 승차 데이터;

                const tData = _.fromPairs(
                  time.map(t => {
                    let t_data = 0;

                    tdList.map(tl => {
                      const tlData = ty_data.filter(d => d.date === tl); // 1호선에 동대문에 2018.12.1에 승차;
                      t_data =
                        t_data +
                        tlData.map(tld => +tld[t]).reduce((a, b) => a + b, 0);
                    });
                    return [t, Math.round(t_data / tdList.length)];
                  })
                );
                return [ty, tData];
              })
            );

            return [td.key, totalData];
          })
        );

        return [id, id_data];
      })
    );

    return [l, l_data];
  })
);

line.map(l => {
  fs.writeFile(`./${month}/${l}.json`, JSON.stringify(filterData[l]), function(
    err
  ) {
    console.log(l);
  });
});
