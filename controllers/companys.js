exports.all = (req,res) => {
    res.status(200).json({success:true,data:[{name:"prueba"},{name:"test"}]});
}