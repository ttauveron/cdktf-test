```
# psql -h localhost -p 5432 --username=role-dev-1
echo '\du' | psql postgresql://dev-1:0FJzC6e9dBJbhsb2FVQTeMA732BN3SzM@localhost:5432/postgres
echo '\du' | psql postgresql://dev-2:UUnU7Y1y9xetHiz7mMBmzsZ6KdD3HWjc@localhost:5433/postgres
```


```
cdktf diff
cdktf deploy
# or
cp terraform.cdktf-test.tfstate cdktf.out/stacks/cdktf-test/terraform.tfstate
terraform -chdir=cdktf.out/stacks/cdktf-test plan
terraform state list -state=terraform.cdktf-test.tfstate
```

