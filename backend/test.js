const { Logtail } = require("@logtail/node");

const logtail = new Logtail("omapuu6zky9GXwjbnrNyuL7J", {
    endpoint: "https://s1231837.eu-nbg-2.betterstackdata.com",
  });
  
async function testLogtail() {
  await logtail.info("Test log from Logtail directly");
  console.log("Log sent to Logtail!");
  await logtail.flush(); // Ensure logs are sent immediately
}

testLogtail();
