using {products.db as database} from '../db/schema';
 
using{products.common as c}from '../db/common';
 
service CatalogService {
    @capabilities : {
        InsertRestrictions.Insertable : true,
        UpdateRestrictions.Updatetable : true,
        DeleteRestrictions.Deletable : true,
        ReadRestrictions.Readable :false
    }
 
    entity BusinessPartnerSrv as projection on database.master.BusinessPartners;
 
    entity AdressSrv as projection on database.master.Adresses;
 
    entity ProductsSrv as projection on database.master.Products;
 
    //Transactional data
 
    entity PurchaseItemSrv as projection on database.transaction.PurchaseItems;
 
    entity PurchaseOrderSrv as projection on database.transaction.PurchaseOrders;

    function getHighestsalaryEmployees() returns array of EmployeeSrv;

    function getHighestPriceProduct() returns array of ProductsSrv;

    entity EmployeeSrv as projection on database.master.Employees{
        *
    }actions{
        action IncreaseSal() returns array of EmployeeSrv;
 
        function top20Employees() returns array of EmployeeSrv;
    };

    action deleteEmployees(ID: UUID) returns String;

    function getHighestSalariedEmployees() returns array of EmployeeSrv;
    
    function getUtilities() returns String;


 
 
action createEmployee(
    Currency_code:String(3),
    ID:UUID,
    accountNUmber:String(16),
    bankId:String(16),
    bankName:c.String64,
    email:c.Email,
    gender:c.Gender,
    language:String(2),
    loginName:String(16),
    nameFirst:c.String64,
    nameIntials:c.String64,
    nameLast:c.String64,
    nameMiddle:c.String64,
    phoneNumber:c.PhoneNumber,
    salaryAmount:c.AmountT
) returns array of EmployeeSrv;
 
 
action createAdress(
      ADDRESS_TYPE: c.String32,
      BUILDING: c.String255,
      CITY:c.String255,
      COUNTRY:c.String255,
      LATITUDE:Decimal,
      LONGITUDE:Decimal,
      NODE_KEY: String(16),
      POSTAL_CODE: String(16),
      STREET:c.String255,
      VAL_END: Date,
      VAL_START: Date
)returns array of AdressSrv;
 
action updateEmployee(
    ID:UUID,
    salaryAmount:c.AmountT,
    Currency_code:String(3)
)returns String;
 
 
action createProduct(
        NODE_KEY:UUID,
        PRODUCT_ID:c.String32,
        TYPE_CODE:String(2),
        CATEGORY:c.String32,
        DESCRIPTION:c.String255,
        TAX_TARRIF_CODE:Integer,
        MEASURE_UNIT:String(2),
        WEIGHT_MEASURE:Decimal(5,2),
        WEIGHT_UNIT:String(2),
        PRICE:Decimal(15,2),
        CURRENCT_CODE:String(5),
        WIDTH:Decimal(5,2),
        DEPTH:Decimal(5,2),
        HEIGHT:Decimal(5,2),
        DIM_UNIT:String(2)
 
)returns array of ProductsSrv;
 
action updateProduct(
    PRICE:Decimal(15,2)
)returns String;
 
 
action deleteEmployee(
    ID:UUID
)returns String;
}