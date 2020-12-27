// Train Operating Company, or TOC for short

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const TOCSchema = new Schema({
    name: String,
    code: String,
    homepageUrl: String,
});

TOCSchema.index(
    {
        name: "text",
        code: "text",
        homepageUrl: "text",
    },
    {
        weights: {
            name: 1,
            code: 2,
            homepageUrl: 3,
        },
    }
);

export default mongoose.model("TOC", TOCSchema);
