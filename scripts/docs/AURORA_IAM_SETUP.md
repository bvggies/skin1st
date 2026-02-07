# Aurora IAM Authentication Setup (fix P1010 "denied access")

If you see **P1010: User `postgres` was denied access on the database `postgres.public`** when deploying or running migrations, the database user does not yet have IAM authentication enabled.

---

## Recommended: Use your own AWS account (forget Vercel‑provided Aurora)

If the Vercel‑linked Aurora cluster has locked settings (no password access, IAM auth can’t be enabled), the simplest path is to **create a new AWS account** and run Aurora there. You get full control: set the master password, open the firewall, and connect from Vercel with plain env vars—no Vercel–AWS integration required.

### 1. New AWS account

- Sign up at [aws.amazon.com](https://aws.amazon.com) (new account, not the one Vercel uses).
- You’ll use this only for RDS/Aurora; Vercel does **not** need to be linked to this account.

### 2. Create Aurora PostgreSQL in your account

- **RDS** → **Create database** → **Amazon Aurora** → **PostgreSQL**.
- Pick a region (e.g. `us-east-1`).
- **Credentials:** choose **Self managed** and set a **master username** (e.g. `postgres`) and **master password**—save the password somewhere safe; you’ll put it in Vercel.
- **Instance / capacity:** e.g. Serverless v2 or a small instance, depending on cost.
- **Connectivity:** **Publicly accessible** = Yes (so Vercel can reach it), or use a VPC and ensure Vercel can reach the DB (e.g. public subnet + security group with inbound 5432 from `0.0.0.0/0` or Vercel’s IPs).
- Create the database and note: **Endpoint** (host), **Port** (usually 5432), **Database name** (often `postgres`), **Master username**, **Master password**.

### 3. Security group

- In RDS → your cluster → **Connectivity & security** → **VPC security group**.
- Edit inbound rules: add **PostgreSQL (5432)** from `0.0.0.0/0` (or restrict to known IPs later) so Vercel’s servers can connect.

### 4. Vercel: use your Aurora (no Vercel–AWS link)

- In **Vercel** → your project → **Settings** → **Environment Variables**:
  - **Remove** any Vercel‑Aurora / Vercel–AWS variables you no longer need (e.g. `AWS_ROLE_ARN`, or old `AWS_PGHOST` if it pointed at the old cluster).
  - **Add** (or set) these for **your** Aurora:
    - `AWS_PGHOST` = Aurora endpoint (e.g. `your-cluster.cluster-xxxx.us-east-1.rds.amazonaws.com`)
    - `AWS_PGUSER` = master username (e.g. `postgres`)
    - `AWS_POSTGRES_PASSWORD` = master password you set in step 2
    - Optional: `AWS_POSTGRES_DB` = `postgres`, `AWS_POSTGRES_PORT` = `5432`
- Do **not** set `DATABASE_URL` to the old Neon URL; the app will build the URL from the `AWS_*` vars above.

### 5. Deploy

- Push and redeploy. The build will run `migrate-deploy.js`, which uses `AWS_PGHOST` + `AWS_PGUSER` + `AWS_POSTGRES_PASSWORD` to connect to **your** Aurora and run migrations, then the app will use the same credentials at runtime.

You can ignore the Vercel‑provided Aurora cluster and any locked IAM/Secrets Manager settings once this is working.

---

## When RDS settings cannot be changed (existing Vercel‑linked cluster)

If **Credentials management**, **IAM database authentication**, and **Kerberos** cannot be changed on the cluster, you **must use the master password**. You do **not** need to change RDS—only **retrieve** the existing password and put it in Vercel.

### If the master password is in AWS Secrets Manager

1. In **AWS Console** → **Secrets Manager** → find the secret for your RDS/Aurora cluster (name often includes the cluster ID or “rds”).
2. Open the secret → **Retrieve secret value**. The JSON usually has a key like `password` or `secret` with the master password.
3. Copy that password value.
4. In **Vercel** → Project → **Environment Variables** → add:
   - **Name:** `AWS_POSTGRES_PASSWORD` (or `POSTGRES_PASSWORD`)
   - **Value:** the password from Secrets Manager
5. Redeploy. The app and migrations will connect using this password; no change to RDS credentials or IAM auth is required.

**Who can do this:** Anyone with permission to read that secret in Secrets Manager (e.g. `secretsmanager:GetSecretValue` on that secret). An AWS admin can grant this without changing RDS.

### If the password is self‑managed and you don’t know it

Only someone who set it (or has it stored) can give you the password to set in Vercel. You cannot “edit” the RDS master password if you don’t have that permission; you only need the **value** to put in Vercel.

---

## What’s needed (for IAM auth—only if you can enable it)

1. **IAM authentication enabled** on the Aurora cluster (RDS console → Modify → enable IAM).
2. **Database user granted `rds_iam`** (see below).
3. **IAM policy** allowing `rds-db:connect` for that user (Vercel/Aurora integration or your role).

## Steps for someone with Aurora master access

Someone who can connect to Aurora (e.g. with the **master password** or from a machine that can reach the DB) must run this **inside PostgreSQL**:

```sql
-- If the user doesn't exist (unusual for postgres):
-- CREATE USER postgres WITH LOGIN;

-- Required for IAM auth: grant the rds_iam role to the user you connect with (e.g. postgres)
GRANT rds_iam TO postgres;
```

- Connect with the **master** user (the one that has the RDS master password).
- Run the `GRANT rds_iam TO postgres;` (or whatever username you use in `AWS_PGUSER`).
- The username in `GRANT rds_iam TO <user>` must match **exactly** the value of `AWS_PGUSER` (case-sensitive).

## If you use password auth instead of IAM

If you have (or can get) the Aurora **master password**:

1. In **Vercel** → Project → Environment Variables, set:
   - `AWS_POSTGRES_PASSWORD` (or `POSTGRES_PASSWORD`) = the Aurora master password.
2. Leave IAM auth optional; the app will use the password and connect without needing `rds_iam`.

## IAM policy (for IAM auth)

The role used by Vercel (e.g. `AWS_ROLE_ARN`) must have a policy like:

```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Action": ["rds-db:connect"],
    "Resource": ["arn:aws:rds-db:REGION:ACCOUNT-ID:dbuser:CLUSTER-RESOURCE-ID/postgres"]
  }]
}
```

Replace `REGION`, `ACCOUNT-ID`, `CLUSTER-RESOURCE-ID`, and `postgres` (if you use a different user) with your values. The cluster resource ID is in RDS → your cluster → Configuration (e.g. `cluster-XXXX`).

## Summary

- **Recommended:** Use **your own AWS account**: create Aurora there with **self‑managed** master password, open the security group for 5432, then set `AWS_PGHOST`, `AWS_PGUSER`, `AWS_POSTGRES_PASSWORD` in Vercel. No Vercel–AWS link or IAM auth needed.
- **P1010 “denied access”** = the DB user is not allowed to connect (often missing `rds_iam` for IAM auth).
- **When RDS settings can’t be changed (existing cluster):** Use the master password. If it’s in **AWS Secrets Manager**, retrieve the secret value and set it in Vercel as `AWS_POSTGRES_PASSWORD`.
- **When IAM auth can be enabled:** Have an Aurora admin run `GRANT rds_iam TO postgres;` and ensure the IAM policy allows `rds-db:connect`.
