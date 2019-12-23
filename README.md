Express + MongoDB (Graphql API and REST API based on OData)

## Install project on Windows system 
### 1. Make sure already setup Node and MongoDB in window OS
  If Not, you need to install Node and MongoDB
  - download Node for window
  - download mongodb for window
    to check mongodb successfully, open command prompt and execute like below:
    ```
    -> mongodb
    ```
### 2. Setup MongoDB database for our project
  - create database and collection (database name is 'mydb', collection name is 'customers' in our project)
    open command prompt and execute follow commands:
     ```
      -> mongo 
     ```
     ```
      -> show dbs 
     ```
     ```
      -> use mydb  
     ```
     ```
      -> show collections   
     ```
     ```
      -> db.createCollection("customers")   
     ```
  - have to be ready data.json containing all json data array
  - import data.json into database to execute below command
     ```
     -> mongoimport --db mydb --collection customers --type json --file data.json --jsonArray
     ```

### 3. Install project
  - just execute below two commands
    ```
     -> npm install   
    ```
    ```  
     -> npm start    
    ```   
  - open broswer and go to http://localhost:3000

--------------------------------------------------------------------------------------------------------------
## Graphql APIs
### Introduction : Go to http://localhost:3000/graphql

You can see Graphiql Interface

And input below query
```  
  {
    products(recordType:"SalesProducts"){
      accountId
      recordType
      dateRecorded
    }
  }
```
And click execute button, this wil get all products that "recordType" is same as "SalesProducts"

How to test this API in CURL: Open cmd and enter follows:
```
  curl -X POST -H "Content-Type:application/json" -d "{\"query\":\"{products(recordType:\\\"SalesProducts\\\"){accountId recordType dateRecorded}}\"}" http://localhost:3000/graphql
```
Also can remove or add columns according to what you want to get Json data
```  
  {
    products(recordType:"SalesProducts"){
      recordType
      dateRecorded
    }
  }

``` 
```
  curl -X POST -H "Content-Type:application/json" -d "{\"query\":\"{products(recordType:\\\"SalesProducts\\\"){recordType dateRecorded}}\"}" http://localhost:3000/graphql
```
```  
  {
    products(recordType:"SalesProducts"){
      recordType
      dateRecorded
      data{
        SalesProductId
      }
    }
  }

``` 
```
curl -X POST -H "Content-Type:application/json" -d "{\"query\":\"{products(recordType:\\\"SalesProducts\\\"){recordType dateRecorded data{SalesProductId}}}\"}" http://localhost:3000/graphql
```
```
{
  products(recordType:"SalesProducts"){
    recordType
    dateRecorded
    data{
      SalesProductId
      SalesProductName
      SalesCategoryName
    }
  }
}
```
```
curl -X POST -H "Content-Type:application/json" -d "{\"query\":\"{products(recordType:\\\"SalesProducts\\\"){recordType dateRecorded data{SalesProductId SalesProductName SalesCategoryName}}}\"}" http://localhost:3000/graphql
```
### How to test Graphql API in Postman
For example 
```
{
  products(recordType:"SalesProducts"){
    recordType
    dateRecorded
    data{
      SalesProductId
      SalesProductName
      SalesCategoryName
    }
  }
}
```
- method : POST
- Headers : 
  1. Content-Type : application/json
  2. Accept : application/json
- Body : select raw
  {"query":"{products(recordType:\"SalesProducts\"){recordType dateRecorded data{SalesProductId SalesProductName SalesCategoryName}}}"}
### More Graphql APIs
To get products that contain substring of RecordType
```
{
  products(substringofRecordType:"products"){
    accountId
    recordType
    dateRecorded
    data{
      SalesProductId
      SalesProductName
      SalesCategoryName
    }
  }
}
```
To get products that start with special string of RecordType
```
{
  products(startswithRecordType:"sales"){
    accountId
    recordType
    dateRecorded
    data{
      SalesProductId
      SalesProductName
      SalesCategoryName
    }
  }
}
```
To get products that end with special string of RecordType
```
{
  products(endswithRecordType:"products"){
    accountId
    recordType
    dateRecorded
    data{
      SalesProductId
      SalesProductName
      SalesCategoryName
    }
  }
}
```
--------------------------------------------------------------------------------------------------------------
## RESTful API based on OData
### Introduction : Go to http://localhost:3000/odata
We can see below result:
```
{"@odata.context":"http://localhost:3000/odata/$metadata","value":[{"kind":"EntitySet","name":"customers","url":"customers"}]}
```
Also can check Model structure of our database collection by using url http://localhost:3010/odata/$metadata
```xml
<edmx:Edmx xmlns:edmx="http://docs.oasis-open.org/odata/ns/edmx" Version="4.0">
  <edmx:DataServices>
    <Schema xmlns="http://docs.oasis-open.org/odata/ns/edm" Namespace="mydb">
      <EntityType Name="Product">
        <Property Name="_id" Type="Edm.String"/>
        <Property Name="accountId" Type="Edm.String"/>
        <Property Name="recordType" Type="Edm.String"/>
        <Property Name="dateRecorded" Type="Edm.String"/>
        <Property Name="data" Type="Edm.Data"/>
        <Key>
          <PropertyRef Name="_id"/>
        </Key>
      </EntityType>
      <EntityType Name="Data">
        <Property Name="SalesProductId" Type="Edm.String"/>
        <Property Name="SalesProductName" Type="Edm.String"/>
        <Property Name="SalesCategoryName" Type="Edm.String"/>
      </EntityType>
      <ComplexType/>
      <EntityContainer Name="Context">
        <EntitySet EntityType="mydb.Product" Name="customers"/>
      </EntityContainer>
    </Schema>
  </edmx:DataServices>
</edmx:Edmx>
```
As you can see basic model is Product that has properties _id, accountId, recordType, dateRecorded and data

also data property is Data model that has properties SalesProductId, SalesProductName, SalesCategoryName

There are EntitySet name, 'customers', which must be same as collection name, can figure out url as below:
```
http://localhost:3000/odata/customers
```
So we can get all data

### More RESTful APIs by using OData queries
- by using $filter 
To get all data that recordType is same as 'SalesProducts' 
```
http://localhost:3000/odata/customers?$filter=recordType eq 'SalesProducts'
```
To get all data that recordType starts with 'Sales'
```
http://localhost:3000/odata/customers?$filter=startswith(recordType,'Sales')
```
To get all data that recordType ends with 'Products'
```
http://localhost:3000/odata/customers?$filter=endswith(recordType,'Sales')
```
To get all data that recordType has 'Product' as substring
```
http://localhost:3000/odata/customers?$filter=substringof(recordType,'Product')
```
- by using $select
To get data of accountId and recordType
``` 
http://localhost:3000/odata/customers?$select=recordType,data 
```
To get data of accountId, recordType and data
```
http://localhost:3000/odata/customers?$select=accountId,recordType,data 
```
- by using $select
To get data by order of recordType
```
http://localhost:3000/odata/customers?$orderby=recordType
```
To get data by ascending order of recordType
```
http://localhost:3000/odata/customers?$orderby=recordType desc
```
To get top 3 data in result
```
http://localhost:3000/odata/customers?$top=3
```
- How to use $select, $orderby and $top at the same time
```
http://localhost:3000/odata/customers?$select=accountId,recordType&$orderby=accountId&$top=3
```
- More queries

To get number of result data
```
http://localhost:3000/odata/customers/$count
```
How to combine eq, or, and 
```
http://localhost:3000/odata/customers?$filter=recordType eq 'SalesProducts' or accountId eq '142895'
```   
```
http://localhost:3000/odata/customers?$filter=substringof(recordType,'Test') and accountId eq '142895'
```
--------------------------------------------------------------------------------------------------------------

## API for personal
- accountId (require)
- recordType (require)
- subdocument of data (optional : $str, str$, $str$)
- sortBy (optional)
- sortDir (optional: ASC or DESC)
### POST
- http://localhost:3000/query
- body: form params
### GET 
```
http://localhost:3000/query?accountId=222222&recordType=InventoryProductMaster
```
```
http://localhost:3000/query?accountId=222222&recordType=InventoryProductMaster&data.InventoryProductName=hot$
```
```
http://localhost:3000/query?accountId=222222&recordType=InventoryProductMaster&data.InventoryProductName=hot$&sortBy=data.InventoryProductName
```
```
http://localhost:3000/query?accountId=222222&recordType=InventoryProductMaster&data.InventoryProductName=hot$&sortBy=data.InventoryProductName&sortDir=DESC
```

- If no parameters except required params(accountId and recordType), that will include all data
--------------------------------------------------------------------------------------------------------------
## Authenficate based on JWT
### how to get token
- URL: localhost:3000/authenticate
- method: POST
- param: username, password (in this project, we can use of users information in config file)
### how to use API
- just set access-token params in header 