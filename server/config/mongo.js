exports.default = { 
  mongo: function(api){
    return {
        enable: true,
        host: 'localhost',
        port: 27017,
        db: 'world_bank_rbf'
    }
  }
}