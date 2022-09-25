const express = require("express");
const PORT = 4000;
const app = express();
const fs = require("fs");
const _ = require("lodash");

const csv = require("fast-csv");
const data = [];
const fss = require("fs/promises");
const { default: validate } = require("deep-email-validator");
const promise = () => {
    return new Promise((resolve, reject) => {
        const data = [];
        csv.parseFile("./email.csv", { skipRows: 1 })
            .on("error", reject)
            .on("data", (row) => {
                data.push(row);
            })
            .on("end", () => {
                resolve(data);
            });
    });
};

const verifyEmail = async (data) => {
    console.log(data.length);
    let arr = [];
    for (const email of data) {
        arr.push(validate(email));
    }
    // console.log(i);
    // console.log(arr);
    return arr;
};

const resolver = async (emails) => {
    // let arr = [];
    // for (const email of emails) {
    //     arr.push(await email);
    // }
    // return arr.flat();

    const results = [];
    while (emails.length) {
        const batch = emails.splice(0, 50);
        const result = await Promise.all(batch);
        results.push(result);
    }
    return _.flatten(results);
};
app.get("/", async (req, res) => {
    let data = [];
    const result = await promise();
    result.map((o) => data.push(o[o.length - 1]));
    const emailPromises = await verifyEmail(data);
    const result2 = await resolver(emailPromises);
    // console.log(result2);
    // res.send(result2);
    res.send({ emails: result2 });
});

app.listen(PORT, () => {
    console.log(`Server is running at PORT ${PORT}`.toUpperCase());
});
// console.time("this");
// const func = async () => {
//     let data = [];
//     const result = await promise();
//     result.map((o) => data.push(o[o.length - 1]));
//     const emailPromises = await verifyEmail(data);
//     // const result2 = await resolver(r);
//     // console.log(result2);
//     // res.send(result2);
//     res.send({ emailPromises });
// };
// func();

// console.timeEnd("this");
