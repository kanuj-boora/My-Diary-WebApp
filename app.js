const express = require("express");
const bodyParser = require("body-parser");
const {CanvasRenderService} = require('chartjs-node-canvas');
const {Chart} = import('chart.js');

const app = express();
const port = 3000;

// const width = 1000;
// const height = 1000;
// const chartCallback = (ChartJS) => {
//   console.log('chart built');
// }

// const canvasRenderService = new CanvasRenderService(width, height, chartCallback);

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

let posts = [
  {
    time: "2023-07-16",
    content:
      "Today is a beautiful day. I woke up early and went for a walk in the park. The sun was shining and the birds were singing. I felt so peaceful and happy. After my walk, I came home and made a delicious breakfast. Then, I spent some time reading and writing. In the afternoon, I went to the library to return some books and check out some new ones. I had dinner with my friends and then we went to see a movie. It was a great day!",
  },
  {
    time: "2023-07-17",
    content:
      "Today was a productive day. I worked on my project all morning and made some great progress. In the afternoon, I went to the gym and worked out. Then, I met up with some friends for dinner. We had a lot of fun and I'm feeling really good about myself right now.",
  },
  {
    time: "2023-07-18",
    content:
      "Today was a bit of a down day. I didn't get much done and I'm feeling a bit stressed out. I think I need to take some time for myself and relax. I'm going to go for a walk in the park and then read a book. Hopefully, that will help me feel better.",
  },
  {
    time: "2023-07-19",
    content:
      "Today was a much better day. I woke up feeling refreshed and motivated. I got a lot done at work and I even had some time to relax and enjoy myself. I went to the movies with my friends and we had a great time. I'm feeling really happy and positive right now.",
  },
  {
    time: "2023-07-20",
    content:
      "Today was a day of self-care. I woke up early and went for a yoga class. Then, I took a long bath and read a book. I felt so relaxed and rejuvenated. In the afternoon, I went out to lunch with my mom. We had a great time catching up and I felt so loved and supported. It was a perfect day.",
  },
  {
    time: "2023-07-13",
    content:
      "Today was a day of adventure. I went hiking in the mountains with my friends. We had a lot of fun exploring and we even saw some wildlife. We ended the day with a campfire and roasted marshmallows. It was a perfect way to end the week.",
  },
  {
    time: "2023-07-01",
    content:
      "I had a really tough day today. I woke up feeling stressed and anxious, and it just got worse as the day went on. I had a meeting at work that didn't go well, and then I got into a fight with my partner. I'm feeling really down right now, and I don't know how to make myself feel better.",
  },
  {
    time: "2023-07-02",
    content:
      "I'm feeling really lonely today. I haven't been able to connect with my friends or family lately, and I'm starting to feel isolated. I know I need to reach out to people, but I'm just not feeling motivated. I'm feeling really down and I don't know what to do.",
  },
  {
    time: "2023-06-03",
    content:
      "I'm feeling really disappointed today. I had been working really hard on a project, and I thought it was going really well. But then I got feedback from my boss, and she said that I needed to make some major changes. I'm feeling really discouraged, and I don't know if I can do it.",
  },
];

function getPostByTime(time) {
  return posts.filter((post) => {
    return post.time == time;
  });
}

function GetSortOrder() {
  return (a, b) => {
    return new Date(b["time"]) - new Date(a["time"]);
  };
}

app.get("/login", (req, res) => {
  res.render("login");
});

app.get("/", (req, res) => {
  posts.sort(GetSortOrder());
  res.render("home", {
    posts: posts,
  });
});

app.get("/compose", (req, res) => {
  let date = new Date().toJSON().slice(0, 10);

  res.render("compose", {
    currDate: date,
  });
});

app.get("/compose/:date", (req, res) => {
  let paraDate = req.params.date;
  let date = new Date().toJSON().slice(0, 10);
  res.render("compose", {
    currDate: paraDate,
  });
});

app.post("/compose", (req, res) => {
  // let date = new Date();
  // let datetime = date.getDate()+"/"+(date.getMonth()+1)+"/"+date.getFullYear();

  // Have to add append enry logic

  const data = {
    time: req.body.composeDate,
    content: req.body.composeData,
  };

  let date = new Date().toJSON().slice(0, 10);

  if (data.time > date) {
    res.redirect("/compose");
  }

  let post = posts.find((el) => el.time == data.time);

  if (post) {
    post["content"] += data.content;
  } else {
    posts.push(data);
  }

  posts.sort(GetSortOrder());

  console.log(data);

  res.redirect("/");
});

function GetPythonData(posts, callback) {
  let pyposts;
  stringPosts = JSON.stringify(posts);

  const py = spawn("python", ["nlp_analysis.py", stringPosts]);

  resultString = "";

  py.stdout.on("data", function (stdData) {
    resultString += stdData.toString();
  });

  py.stdout.on("end", () => {
    let resultData = JSON.parse(resultString);

    pyposts = resultData["pyposts"];

    // console.log(pyposts);
  });

  py.on("exit", (code) => {
    console.log(`Python process ended with code: ${code}`);
    if (code == 0) {
      callback(pyposts);
    }
  });
}

const spawn = require("child_process").spawn;
app.get("/analysis", (req, res) => {
  GetPythonData(posts, (result) => {
    result = JSON.parse(result);

    // (async function() {
    //   new Chart(
    //     document.getElementById('pos-neg-chart'),
    //     {
    //       type: 'bar',
    //       data: {
    //         labels: ['pos-sentiment'],
    //         datasets: [
    //           {
    //             data: result.map(row=>row.data[1])
    //           }
    //         ]
    //       }
    //     }
    //   );
    // })();

    res.render('analysis', {posts: result});
  });
  // GetPythonData(posts).then((result) => {
  //   console.log(result);
  // });

  // let analysisData = CallPythonScript(posts);

  // res.render('analysis', {posts: analysisData});
});

app.get("/:date", (req, res) => {
  const editDate = req.params.date;

  let post = posts.find((ele) => ele["time"] == editDate);

  res.render("entry", { post: post });
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.get("/logout", (req, res) => {
  res.render("login");
});

app.listen(port, () => {
  console.log(`Example listening on port: ${port}`);
});


// Add summary of diary entries
// Overall activity category
// travel locations