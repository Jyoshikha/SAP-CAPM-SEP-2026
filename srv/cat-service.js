const cds = require('@sap/cds');
const { uuid,exists, isdir, mkdirp,readSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSS } = require('@sap/cds/lib/utils/cds-utils');
module.exports = cds.service.impl(async function () {
 
    const { EmployeeSrv, ProductSrv, PurchaseItemSrv, BusinessPartnerSrv, AdressSrv} = this.entities;
 
    // Implementation of an action
    // There are 3 generic handlers
    // .before() : Pre-check and validation
    // .on() : Performing DB operations
    // .after() : To save / close connections
    this.before("UPDATE", EmployeeSrv, async(request, response)=>{
        const salaryAmt = request.data.salaryAmount;
        if (salaryAmt > 100000) {
            request.error(500,'Please get the approval from your line manager.');
        }

    })

    this.before("UPDATE", ProductSrv, async(request, response)=>{
        const Price = request.data.ProductsSrv;
        if(Price > 100000){
            request.error(500,'Please get the approval from your line manager.');
        }
    })
    
    this.before(['CREATE', 'UPDATE'], PurchaseItemSrv, async (request) => {
    const itemPos = request.data.PO_ITEMS_POS;
    if (itemPos !== undefined && itemPos % 10 !== 0) {
        request.error(
            400,
            'Item position should be a multiple of 10'
        );
    }
});
   

    this.before('UPDATE', BusinessPartnerSrv, async (request) => {
 
    const companyName = request.data.COMPANY_NAME;
 
    if (companyName && /[,\.\-]/.test(companyName)) {
        request.error(400, 'Invalid company name');
    }
 
});

    this.before('UPDATE', AdressSrv, async (request) => {
 
    const country = request.data.COUNTRY;
 
    if (country && !['GB', 'US'].includes(country)) {
        return request.reject(
            400,
            'Please contact your admin'
        );
    }
 
});

    this.before('UPDATE', EmployeeSrv, async (request) => {
 
    const mobile = request.data.phoneNumber;
 
    if (mobile && !(mobile.startsWith('+1') || mobile.startsWith('+44'))) {
        request.error(400, 'Cannot update mobile number');
    }
 
});

    this.on("createEmployee", async (request, response) => {
 
        // Step - 2 : Get the data which is coming from the API
        const empData = request.data;
 
        // Step - 3 : Instantiate the transaction object
        const objTransaction = cds.tx(request);
 
        // Step - 4 : Insert the record into database
        let returnData = await objTransaction.run([
            INSERT.into(EmployeeSrv).entries(empData)
        ]).then((resolve, reject) => {
            if (typeof(resolve) !== undefined) {
                return request.data;
            } else {
                request.error(500, "Error in inserting data into the database");
            }
        }).catch(err => {
            request.error("There is an error : ", err.toString());
        })
 
        // Step - 5 : Return the data
        return returnData;
    })

    this.on('getHighestSalariedEmployees', async(request,response)=>{
        try{
            //Step 1: Create an object for the transaction
            const transaction = cds.tx(request);
            //Step 2: Get Salaries of an employee using Transaction object
            const response = await transaction.read(EmployeeSrv).orderBy({
                salaryAmount : 'desc'
            }).limit(10);
            //Step 3: Display the Employee Salaries
            return response;
        } catch(error){
            request.error("Error: ",error)
        }
    })

 
    this.on('getHighestPricedProduct', async(request,response)=>{
        try{
            const transaction = cds.tx(request);
            const response = await transaction.read(ProductSrv).orderBy({
                PRICE : 'desc'
            }).limit(10);
            return response;
        } catch(error){
            request.error("Error: ",error)
        }
    })

     this.on('increasePrice',async(request,response)=>{
        try{
            const key= request.params[0];
            const txn=cds.tx(request);
            // const product = await txn.read(ProductSrv)
            //                 .where(key);
            const product = await txn.run(
                        SELECT.one
                        .from(ProductSrv)
                        .where(key)
            );
            const currentPrice = Number(product.PRICE);
            // 3. Increase by 10%
            const newPrice = (currentPrice * 1.10).toFixed(2);
            console.log("Old price:", product.PRICE);
            console.log("New price:", newPrice);
            console.log("Type:", typeof newPrice);
            await txn.update(ProductSrv).with({
                PRICE: newPrice
            }).where(key)
           
            const updateprice=await txn.read(ProductSrv);
            return updateprice;
        }
        catch(error){
            return "Error :" +error.toString();
        }
    })
    this.on('IncreaseSal', async (req) => {
 
    const { ID } = req.params[0];
    const tx = cds.tx(req);
 
    const employee = await tx.read(EmployeeSrv).where({ ID });
 
    const newSalary = employee[0].salaryAmount * 1.10;
 
    await tx.update(EmployeeSrv)
        .with({ salaryAmount: newSalary })
        .where({ ID });
 
    return await tx.read(EmployeeSrv).where({ ID });
});
this.on('getUtilities',async (request, response) => {
    let vUUID = uuid(), vpackageContent = null, vInput = "%E%A4%A", url, dirExits = false, isFileExists = false;

    //Exists
    if ( exists('srv/request.http')){
        isFileExists = true;
    }

    //Is directory exists or not 
    if(isdir('app'))
    {
        dirExists = true;
    }

    //Decode URI
    try {
        uri = decodeURI(vInput);
        //MAke Directory
        await mkdirp('srv/lib')
    }catch {
        uri = vInput;
    }
    vpackageContent =  await read('package.json');
    //Final Value
    var finalValue = {
        uuid : vUUID,
        uri : uri,
        isFileExists : isFileExists,
        packageInfo : vpackageContent
    }
    return finalValue;
})
 //this has the changes to sync
// Comment2

this.on('top20Employees', async (request, response) => {
    try{
        //step -1 create an object for the transaction
        const transaction = cds.tx(request);
 
        //step-2 : Get salaries of an employee using Transaction object
        const result = await transaction.read(EmployeeSrv).orderBy({
            salaryAmount : 'desc'
 
        }).limit(20);
 
        //step-3 : Display the employee salaries
        return result;
 
    }
    catch (error) {
        request.error("Error :", error)
    }
})

 
    this.on('updateEmployee', async (request, response)=>{
        const{
            ID,
            salaryAmount,
            Currency_code
        }=request.data;
 
        try{
            const objTransaction=cds.tx(request);
 
            await objTransaction.update(EmployeeSrv).with({
                salaryAmount:salaryAmount,
                Currency_code:Currency_code,
            }).where({
                ID:ID
            })
            return "Successfully updated";
        }catch(error){
            request.error("Error:", error)
        }
    })
 
 
    this.on('updateProduct', async (request, response)=>{
        const{
            PRICE
        }=request.data;
 
        try{
            const objTransaction=cds.tx(request);
 
            await objTransaction.update(ProductSrv).with({
                PRICE:PRICE,
            }).where({
                ID:ID
            })
            return "Successfully updated";
        }catch(error){
            request.error("Error:", error)
        }
    })
 
 
     this.on("createProduct", async (request, response) => {
 
        // Step - 2 : Get the data which is coming from the API
        const proData = request.data;
 
        // Step - 3 : Instantiate the transaction object
        const objTransaction = cds.tx(request);
 
        // Step - 4 : Insert the record into database
        let returnData = await objTransaction.run([
            INSERT.into(ProductsSrv).entries(proData)
        ]).then((resolve, reject) => {
            if (typeof(resolve) !== undefined) {
                return request.data;
            } else {
                request.error(500, "Error in inserting data into the database");
            }
        }).catch(err => {
            request.error("There is an error : ", err.toString());
        })
 
        // Step - 5 : Return the data
        return returnData;
    })
 
    this.on("deleteEmployee", async (request, response) => {
        const{
            ID
        }=request.data;
        try{
            const objTransaction=cds.tx(request);
 
            await objTransaction.delete(EmployeeSrv).where({
                ID:ID
            })
 
            return "Successfully Deleted";
        }catch(error){
            request.error("Error:", error)
        }
    })
 
 
})
 
 