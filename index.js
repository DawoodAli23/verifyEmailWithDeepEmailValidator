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
    csv
      .parseFile("./email.csv", { skipRows: 1 })
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
  let verifiedEmails = [];
  let rejectedEmails = [];
  for (const email of data) {
    try {
      const result = await validate(email);
      result.valid
        ? verifiedEmails.push({ email: result })
        : rejectedEmails.push({ email: result });
    } catch (error) {}
  }
  return { verifiedEmails, rejectedEmails };
};

app.get("/", async (req, res) => {
  let data = [];
  const result = await promise();
  result.map((o) => data.push(o[o.length - 1]));
  const resolvedObject = await verifyEmail(data);
  return res.send({ emails: resolvedObject });
});

app.listen(PORT, () => {
  console.log(`Server is running at PORT ${PORT}`.toUpperCase());
});
