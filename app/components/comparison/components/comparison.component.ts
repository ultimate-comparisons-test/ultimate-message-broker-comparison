import { Component, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { Data, CriteriaSelection, Criteria } from '../shared/index';
import { ComparisonConfigService } from './comparison-config.service';
import { ComparisonDataService } from './comparison-data.service';
import { ComparisonService } from './comparison.service';
import { ComparisonCitationService } from './comparison-citation.service';
import { VersionInformation } from '../../../VersionInformation';
import { Http } from '@angular/http';
import { LocalStorageService } from "angular-2-local-storage";

const FileSaver = require('file-saver');

@Component({
    selector: 'comparison',
    templateUrl: '../templates/comparison.template.html',
    styleUrls: ['../styles/comparison.component.css']
})
export class ComparisonComponent {
    criteriaSelection = [];
    private query: {[name: string]: CriteriaSelection; } = {};
    private changed = 0;
    private order: Array<String> = [];
    private orderOption: Array<number> = [];
    private ready = false;
    private versionInformation: VersionInformation = new VersionInformation();
    @ViewChild('details') detailsModal: any;
    private activeRow: Data = new Data(this.lss, this.dataServ, this.serv);
    private showTable = false;
    private showTableTooltips = true;
    private tableTooltipsAsFootnotes = false;
    @ViewChild('latextable') latexTable: ElementRef;
    @ViewChild('settings') settingsModal: any;

    constructor(private http: Http,
                public serv: ComparisonService,
                public dataServ: ComparisonDataService,
                public confServ: ComparisonConfigService,
                public citationServ: ComparisonCitationService,
                private cd: ChangeDetectorRef,
                private lss: LocalStorageService) {
        this.confServ.loadComparison(this.cd);
        this.confServ.loadCriteria(this.cd);
        this.confServ.loadTableData(this.cd);
        this.confServ.loadDescription(this.cd);
        this.citationServ.loadCitationData(this.cd);
    }

    public getVersionInformation(): VersionInformation {
        return this.versionInformation;
    }

    private criteriaChanged(value: Array<String>, crit: Criteria) {
        if (value) {
            this.query[crit.tag] = new CriteriaSelection(value, crit);
        }
        this.cd.markForCheck();

        this.change();
    }

    private showDetails(data: Data) {
        this.activeRow = data;
        this.detailsModal.open();
    }

    private showTableProperties() {
        this.settingsModal.open();
    }

    private downloadLatexTable() {
        let content: string = this.latexTable.nativeElement.textContent;
        content = content.substr(content.indexOf('%'), content.length);
        const blob: Blob = new Blob([content], {type: 'plain/text'});
        FileSaver.saveAs(blob, 'latextable.tex');
        return window.URL.createObjectURL(blob);
    }

    private previewLatexTable(show) {
        if (show) {
            this.latexTable.nativeElement.classList.remove('ltable');
        } else {
            this.latexTable.nativeElement.classList.add('ltable');
        }
    }

    public displayReferences(): boolean {
        if (this.citationServ.check && this.citationServ.references.length > 0 && !this.ready) {

            setTimeout(() => {
                this.ready = true;
            }, 1000);
        }
        return this.ready;
    }

    public change() {
        if (this.changed === 1) {
            this.changed = 0;
        } else {
            this.changed = 1;
        }
    }

    public changeDisplayTemplate() {
        if (this.confServ.comparison) {
            this.confServ.comparison.displaytemplate = !this.confServ.comparison.displaytemplate;
        }
        this.change();
    }

    public changeDisplayAll() {
        if (this.confServ.comparison) {
            this.confServ.comparison.displayall = !this.confServ.comparison.displayall;
        }
        this.change();
    }

    public changeEnabled(item: Data) {
        item.enabled = !item.enabled;
        this.change();
    }
}
