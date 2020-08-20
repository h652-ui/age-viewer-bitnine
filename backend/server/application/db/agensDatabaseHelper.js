const ag = require('agensgraph');

class AgensDatabaseHelper {
    constructor({ host, port, database, graph, user, password } = {}) {
        this._host = host;
        this._port = port;
        this._database = database;
        this._graph = graph;
        this._user = user;
        this._password = password;
    }

    async isHealth() {
        let result = false;
        if (this.toPoolConnectionInfo() == null) {
            return result;
        }

        let client = null;
        try {
            client = await this.getConnection();
            await client.query('SELECT 1');
            client.release();

            result = true;
        } catch (err) {
            console.error('isHealth() Error Occurred!!!: ', err.message);
        } finally {
            return result;
        }
    }

    async execute(query) {
        let client = await this.getConnection();
        let result = null;
        try {
            await client.query(`set graph_path=${this._graph}`);
            result = await client.query(query);
        } catch (err) {
            console.error('Execute Error: ', err.message);
            throw err;
        } finally {
            client.release();
        }
        return result;
    }

    getConnection() {
        if (!this._pool) {
            console.log("CREATE")
            this._pool = new ag.Pool(this.toPoolConnectionInfo());
        }
        return this._pool.connect();
    }

    async releaseConnection() {
        try {
            await this._pool.end();
            return true;
        } catch (err) {
            console.error('releaseConnection() {}', err.message);
            throw err;
        }
    }

    toPoolConnectionInfo() {
        if (!this._host || !this._port || !this._database) {
            return null;
        }
        return {
            host: this._host,
            port: this._port,
            database: this._database,
            user: this._user,
            password: this._password,
            max: 10,
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 2000,
        };
    }

    toConnectionInfo() {
        if (!this._host || !this._port || !this._database) {
            return null;
        }
        return {
            host: this._host,
            port: this._port,
            database: this._database,
            user: this._user,
            password: this._password,
            graph: this._graph,
        };
    }
}

module.exports = AgensDatabaseHelper;
