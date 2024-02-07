import mongoose from 'mongoose'
const Schema = mongoose.Schema

const Payments = new Schema({
  Title: { type: String },
  Customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Users' },
  Content: { type: String },
  CreatedAt: { type: Date, default: Date.now },
})

const PaymentsModel = mongoose.model('Payments', Payments)

export default PaymentsModel
