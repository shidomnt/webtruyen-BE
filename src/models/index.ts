import mongoose from "mongoose";

const { Schema } = mongoose;

type Url = string;

interface Chapter {
  chapNumber: number,
  url: Url,
  images: Array<Url>
}

interface Truyen {
  url: Url,
  title: string,
  otherName?: Array<string>,
  author: string,
  status: string,
  kind: Array<string>,
  slug?: string,
  chapters: Array<Chapter>,
  cover: Url,
}

const SchemaChapter = new Schema<Chapter>( {
  chapNumber: Number,
  url: String,
  images: [String]
})

const SchemaTruyen = new Schema<Truyen>({
  url: String,
  title: String,
  otherName: [String],
  author: String,
  status: String,
  kind: [String],
  slug: String,
  cover: String,
  chapters: [SchemaChapter]
})

const TruyenModel = mongoose.model('Truyen', SchemaTruyen);

export {
  TruyenModel
};

export type {
  Truyen,
  Chapter,
  Url,
}
