/*
Copyright 2008 TIBCO Software Inc.

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
*/
package org.openqa.selenium.server.htmlrunner;

import org.apache.commons.logging.Log;
import org.mortbay.log.LogFactory;

import java.util.*;
import java.util.Date;
import java.util.regex.Pattern;
import java.io.IOException;
import java.text.MessageFormat;
import java.text.SimpleDateFormat;
import java.sql.*;
import java.net.InetAddress;
import java.net.UnknownHostException;

/**
 * GITAK database report of the GITestRunner derived from Selenium HTMLRunner (aka TestRunner, FITRunner)
 *
 * @author Darren Hwang
 */
public class DatabaseTestResults {
    static Log log = LogFactory.getLog(DatabaseTestResults.class);

    private final String result;
    private final String totalTime;
    private final String numTestTotal;
    private final String numTestPasses;
    private final String numTestFailures;
    private final String numCommandPasses;
    private final String numCommandFailures;
    private final String numCommandErrors;
    private final String seleniumVersion;
    private final String seleniumRevision; // not used?
    private final String logUrl;
	private final String dbOption;
	private final String productName;
    //private final HTMLSuiteResult suite;


    private final List<String> testTables;
    private final List<String> testFailed;
    private final List<String> testPassed;
    private final String timestamp;
    private final Date runTime;

    static Connection ctn;

    public DatabaseTestResults(String postedSeleniumVersion, String postedSeleniumRevision,
                               String postedResult, String postedTotalTime,
                               String postedNumTestTotal, String postedNumTestPasses,
                               String postedNumTestFailures, String postedNumCommandPasses,
                               String postedNumCommandFailures, String postedNumCommandErrors,
                               List<String> postedTestTables,
                               List<String> postedTestFailed,
                               List<String> postedTestPassed
                               ) {

        result = postedResult;
        numCommandFailures = postedNumCommandFailures;
        numCommandErrors = postedNumCommandErrors;
        //suite = new HTMLSuiteResult(postedSuite);
        totalTime = postedTotalTime;
        numTestTotal = postedNumTestTotal;
        numTestPasses = postedNumTestPasses;
        numTestFailures = postedNumTestFailures;
        numCommandPasses = postedNumCommandPasses;
        testTables = postedTestTables;
        testFailed = postedTestFailed;
        testPassed = postedTestPassed;
        seleniumVersion = postedSeleniumVersion;
        seleniumRevision = postedSeleniumRevision;
		productName = System.getProperty("product.name", "GI");
		dboption = System.getProperty("gitak.reportdb", "false");
        // resultfile property is set by the -htmlSuite option 4th parameter	
        String filename = System.getProperty("htmlSuite.resultFilePath");
        // After the last slash should be the filename
        int lastslash = filename.lastIndexOf("/") > 0 ? filename.lastIndexOf("/"): filename.lastIndexOf("\\");
        if (lastslash > 0)
            filename = filename.substring(lastslash+1);
        logUrl = System.getProperty("product.name", "gi") + "/" + System.getProperty("product.build", "BUILD") + "/" + System.getProperty("gitak.system", "PLATFORM") +
                "/" + filename;
        timestamp = String.valueOf(new Date().getTime());
        runTime = new Date();
        if (this.getDbReportOption()) {
            try {
            log.info("Writing result to database...");
            Class.forName("oracle.jdbc.driver.OracleDriver");

            String uid = System.getProperty("database.username");
            String passwd = System.getProperty("database.password");
            String url = System.getProperty("database.url");
            ctn = DriverManager.getConnection(url, uid, passwd);
            }
            catch (Exception e) {
                e.printStackTrace();
                System.out.print( e.getMessage() );
            }
        }
    }


    public String getResult() {
        return result;
    }
    public String getNumCommandErrors() {
        return numCommandErrors;
    }
    public String getNumCommandFailures() {
        return numCommandFailures;
    }
    public String getNumCommandPasses() {
        return numCommandPasses;
    }
    public String getNumTestFailures() {
        return numTestFailures;
    }
    public String getNumTestPasses() {
        return numTestPasses;
    }
    public Collection getTestTables() {
        return testTables;
    }
    public String getTotalTime() {
        return totalTime;
    }
    public int getNumTotalTests() {
        return Integer.parseInt(numTestPasses) + Integer.parseInt(numTestFailures);
    }

    public static void qaSqlExecute(String statement) {
        try {
            sqlExecute("oracle.jdbc.driver.OracleDriver", statement);
            //System.out.println("createRootElement" + sqlstmt); // debug

         } catch (Exception ex) {
            //ex.printStackTrace();
             System.out.println(ex.getMessage());
        }
    }

    public static Object[][] sqlExecute(String driver, String statement) throws SQLException
    {
        Statement stmt = null;
        //ResultSet rst = null; // for Select query
        Object[][] result = null;
        try {
            Class.forName(driver);

            stmt = ctn.createStatement();

            System.out.println( "\nSQL: " + statement );
            System.out.flush();

            stmt.execute(statement);
            int updateCount = stmt.getUpdateCount();

            //String upperSqlStr = (statement.toUpperCase()).trim();
            System.out.println( "Number of rows affected = " + updateCount );
            System.out.flush();

            stmt.close();
        }
        catch (Exception e) {
            e.printStackTrace();
            System.out.print( e.getMessage() );
            if (stmt != null) stmt.close();
        }
        return result;
    }

   public String formatDateTime(java.util.Date thisDate) {
        String format = "yyyy/MM/dd-HH:mm:ss";
        SimpleDateFormat sformat = new SimpleDateFormat(format);
        if (thisDate == null) thisDate = new java.util.Date();
        String dateString;
       dateString = sformat.format(thisDate);
       return dateString;
    }

    public boolean getDbReportOption() {
        return dboption.equalsIgnoreCase("true");
    }

    public synchronized String createSqlTestCaseStatement(String runId, String setName, String caseId, boolean testPassed, String message) {
        MessageFormat mf = new MessageFormat("insert into tsi_tests_case(RUN_ID, SET_NAME, CASE_ID, VARIANT_SEQ, " +
                "TEST_RESULT, IS_MANUAL, NOTE) values(''{0}'', ''{1}'', ''{2}'', 1, ''{3}'', ''N'', ''{4}'')");
        String testResult = "PASSED";
        String note = "";

        if (!testPassed) {
            testResult = "FAILED";
            note = message.replace('\u0000', ' ');
            note = note.replace('"', ' ');
            note = note.replace('\'', ' ');
        }
        if (setName.length() > 29)
        setName = setName.substring(0,27);   // column size = 30
        if (caseId.length() > 39)
        caseId = caseId.substring(0,37); // column size = 40
        if (note.length() > 200) {
           int start = note.length() - 195;
           note = note.substring(start,note.length()) + "...";
        }

        Object[] caseRecord = {runId, setName, caseId, testResult, note};
        return mf.format(caseRecord);
    }

    public String[] splitTestString(String result, String REGEX) {
        //String REGEX = "|";
        Pattern p = Pattern.compile(REGEX);
        return p.split(result);
    }

    public void write() throws IOException {
       // insert Datbase TestSuiteName
        String setname = "";// TODO - implement suite.getName()?
        String runId = getRunId();
        String username= System.getProperty("gitak.username", System.getProperty("user.name"));
        String platform = System.getProperty("gitak.system", System.getProperty("os.name") + "-" + System.getProperty("os.version"));
        String hostname= System.getProperty("gitak.hostname");
        if (hostname == null) {
            try {
                InetAddress addr = InetAddress.getLocalHost();
                hostname = addr.getHostName();
            } catch (UnknownHostException e) {
                e.printStackTrace();
            }
        }

        if (this.getDbReportOption()) {
           String gitakVersion = this.seleniumVersion;

           String sqlstmt = "INSERT INTO tsi_tests_run(RUN_ID, HOSTNAME, PLATFORM, USER_NAME, " +
                "START_TIME, END_TIME, PRODUCT_NAME, PRODUCT_VERSION, PRODUCT_BUILD, CATEGORY, STATUS, " +
                "NUM_TC_STARTED, NUM_TC_PASSED, NUM_TC_FAILED, NUM_TC_MANUAL, NUM_TC_UNCERTAIN, LOG_URL, " +
                "NOTE, T_TESTS_VERSION) VALUES(" +
                "'"  + runId +
                "', '" + hostname +
                "', '" + platform +
                "', '"+ username + "', " +
                //"to_date('" + formatDateTime(runTime) + "', 'yyyy/mm/dd-hh24:mi:ss'), " +
                " SYSDATE," +
                // "to_date('" + formatDateTime(null) + "', 'yyyy/mm/dd-hh24:mi:ss'), " +
                " SYSDATE," +
                " '" + System.getProperty("product.name", "gi") +       // PDMS predefine product acronym
                "', '" +  System.getProperty("product.version", "0.0") + // Version id like 3.5.1.7
                "', '" + System.getProperty("product.build", "BUILD") +    // Top level label, use full version id like 3.5.1V7
                "', '"+ System.getProperty("database.category", "functional") + // -Ddatabase.category=ui for PDMS UI test category
                "', null, " + // No status yet.
                numTestTotal + ", " + numTestPasses+ ", "+  numTestFailures +", 0, 0, '"+ logUrl +"', null, '"+ gitakVersion +"' )";
            qaSqlExecute(sqlstmt);


            if (testPassed.size() > 0) {
                String[] split= splitTestString(testPassed.get(0), ":");
                setname = split[0];
            } else if (testFailed.size() > 0) {
                String[] split= splitTestString(testFailed.get(0), ":");
                setname = split[0];
            }
            if (setname.length() > 27) {
                setname = setname.substring(0,27); // set_name column size = 30
            }
            System.out.println("set="+setname);
            String sqlset = "INSERT INTO tsi_tests_set(RUN_ID, SEQ_NO, SET_NAME, OWNER," +
                "START_TIME, END_TIME, NUM_TC_STARTED, NUM_TC_PASSED, NUM_TC_FAILED, NUM_TC_MANUAL, NUM_TC_UNCERTAIN, LOG_URL, NOTE) " +
                " VALUES('" + runId + "', null, '"+setname+"', '"+ username + "', " +
                //"to_date('" + formatDateTime(runTime) + "', 'yyyy/mm/dd-hh24:mi:ss'), " +
                " SYSDATE, SYSDATE, 0, 0, 0, 0, 0, null, null)";
            qaSqlExecute(sqlset);


		// TODO -- consolidate into a single testCaseResult list.
        for (int i = 0; i < testFailed.size(); i++) {
            String tfail = testFailed.get(i).replace("\u00a0", "&nbsp;");
            // parse failed test string and insert to Database
            System.out.println(tfail);
            String[] values = splitTestString(tfail, "\\|");
            if (values.length > 0) {
               System.out.println(values[0]);
               System.out.println(values[1]);

               String[] names = splitTestString(values[0], ":");
               String testSet = names[0];
               String testCase = "No Name Test Case"; // default test case name if one is not present
               if (names.length > 1) {
                  testCase = names[1];
               }
               System.out.println("set="+testSet+ ",case="+testCase);
               qaSqlExecute(this.createSqlTestCaseStatement(runId, testSet, testCase, false, tfail));
            }
        }

        for (int i = 0; i < testPassed.size(); i++) {
            String tpass = testPassed.get(i).replace("\u00a0", "&nbsp;");
            System.out.println(tpass);
                String[] names = splitTestString(tpass, ":");
                String testSet = names[0];
                String testCase = "No Name Test Case"; // default test case name if one is not present
                if (names.length > 1) {
                  testCase = names[1];
                }
                System.out.println("set="+testSet+ ",case="+testCase);
                String stmt= this.createSqlTestCaseStatement(runId, testSet, testCase, true, null);

                qaSqlExecute(stmt);
        }
        // Update runtime with actual elapsed time from posted result
        runTime.setTime(runTime.getTime() + Long.parseLong(this.getTotalTime()));

        // Updating test set/suite to close
        String updateSet = "update tsi_tests_set set seq_no=0, owner=''{0}'', end_time=to_date(''{1}'',''yyyy/mm/dd-hh24:mi:ss'')," +
        " num_tc_passed={2}, num_tc_failed={3} where run_id=''{4}'' and set_name=''{5}''";  // update ? log_url=''
        Object[] setVal = {username, formatDateTime(runTime), numTestPasses, numTestFailures, getRunId(), setname };
        //if (this.getDbReportOption())
          qaSqlExecute(MessageFormat.format(updateSet, setVal));

        // Updating test run to close
        String updateRun = "update tsi_tests_run set end_time=to_date(''{0}'',''yyyy/mm/dd-hh24:mi:ss''), status=''COMPLETED''," +
        " NUM_TC_PASSED={1}, NUM_TC_FAILED={2} where run_id = ''{3}''";
        Object[] runVal = {formatDateTime(runTime), numTestPasses, numTestFailures, getRunId()};
        //if (this.getDbReportOption())
           qaSqlExecute(MessageFormat.format(updateRun, runVal));

        try { // close connection when done.
            ctn.close();
        } catch (SQLException e) {
            e.printStackTrace();
        }
      } // if this.getDbReportOption
    }

    private String getRunId() {
        //String user_run_id = System.getProperty("gitak.runid");
        String runid = productName.toUpperCase();
        //System.out.println(runid + timestamp);
        return runid + timestamp;
    }

}
